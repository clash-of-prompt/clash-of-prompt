module clash_of_prompt::game_arena {
    use std::signer;
    use std::vector;
    use initia_std::block;
    use initia_std::simple_map::{Self, SimpleMap};

    /// Only the module publisher can call this function.
    const ENOT_ADMIN: u64 = 1;
    /// Lobby not found.
    const ELOBBY_NOT_FOUND: u64 = 2;
    /// Lobby is not in the expected status.
    const EINVALID_STATUS: u64 = 3;
    /// Cannot join your own lobby.
    const ECANNOT_JOIN_OWN: u64 = 4;
    /// Both scores must be submitted before settling.
    const ESCORES_NOT_READY: u64 = 5;

    const STATUS_OPEN: u8 = 0;
    const STATUS_JOINED: u8 = 1;
    const STATUS_SETTLED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    const MAX_LEADERBOARD: u64 = 100;

    struct ScoreEntry has store, copy, drop {
        player: address,
        enemy_id: u64,
        score: u64,
        turns: u64,
        avg_creativity: u64,
        timestamp: u64,
        is_pvp: bool,
    }

    struct Leaderboard has key {
        entries: vector<ScoreEntry>,
    }

    struct PvPLobby has store, copy, drop {
        id: u64,
        creator: address,
        opponent: address,
        enemy_id: u64,
        wager: u64,
        creator_score: u64,
        opponent_score: u64,
        status: u8,
    }

    struct PvPState has key {
        lobbies: vector<PvPLobby>,
        next_id: u64,
    }

    // CLASH token balance tracker (simple on-chain ledger)
    struct ClashBalances has key {
        balances: SimpleMap<address, u64>,
        total_minted: u64,
    }

    fun init_module(admin: &signer) {
        move_to(admin, Leaderboard { entries: vector::empty() });
        move_to(admin, PvPState { lobbies: vector::empty(), next_id: 0 });
        move_to(admin, ClashBalances {
            balances: simple_map::new(),
            total_minted: 0,
        });
    }

    /// Initialize ClashBalances if not yet created (for module upgrades).
    public entry fun init_clash_balances(admin: &signer) {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);
        if (!exists<ClashBalances>(@clash_of_prompt)) {
            move_to(admin, ClashBalances {
                balances: simple_map::new(),
                total_minted: 0,
            });
        };
    }

    // --- CLASH Balance Tracking -----------------------------------------------

    /// Reward CLASH tokens to a player (admin only).
    public entry fun reward_clash(
        admin: &signer,
        player: address,
        amount: u64,
    ) acquires ClashBalances {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let cb = borrow_global_mut<ClashBalances>(@clash_of_prompt);
        if (simple_map::contains_key(&cb.balances, &player)) {
            let current = simple_map::borrow_mut(&mut cb.balances, &player);
            *current = *current + amount;
        } else {
            simple_map::add(&mut cb.balances, player, amount);
        };
        cb.total_minted = cb.total_minted + amount;
    }

    #[view]
    public fun get_clash_balance(player: address): u64 acquires ClashBalances {
        let cb = borrow_global<ClashBalances>(@clash_of_prompt);
        if (simple_map::contains_key(&cb.balances, &player)) {
            *simple_map::borrow(&cb.balances, &player)
        } else {
            0
        }
    }

    // --- Leaderboard ----------------------------------------------------------

    /// Record a score to the leaderboard (admin only). Keeps top 100 sorted desc.
    public entry fun record_score(
        admin: &signer,
        player: address,
        enemy_id: u64,
        score: u64,
        turns: u64,
        avg_creativity: u64,
        is_pvp: bool,
    ) acquires Leaderboard {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let lb = borrow_global_mut<Leaderboard>(@clash_of_prompt);
        let entry = ScoreEntry {
            player,
            enemy_id,
            score,
            turns,
            avg_creativity,
            timestamp: block::get_current_block_timestamp(),
            is_pvp,
        };

        // Insert in sorted position (descending by score)
        let len = vector::length(&lb.entries);
        let i = 0u64;
        while (i < len) {
            let existing = vector::borrow(&lb.entries, i);
            if (score > existing.score) {
                break
            };
            i = i + 1;
        };
        vector::insert(&mut lb.entries, i, entry);

        // Trim to top 100
        while (vector::length(&lb.entries) > MAX_LEADERBOARD) {
            vector::pop_back(&mut lb.entries);
        };
    }

    #[view]
    public fun get_leaderboard(): vector<ScoreEntry> acquires Leaderboard {
        let lb = borrow_global<Leaderboard>(@clash_of_prompt);
        lb.entries
    }

    // --- PvP Lobbies ----------------------------------------------------------

    /// Create a new PvP lobby and lock the wager.
    public entry fun create_lobby(
        creator: &signer,
        enemy_id: u64,
        wager: u64,
    ) acquires PvPState, ClashBalances {
        let creator_addr = signer::address_of(creator);

        // Deduct wager from creator balance
        let cb = borrow_global_mut<ClashBalances>(@clash_of_prompt);
        let bal = simple_map::borrow_mut(&mut cb.balances, &creator_addr);
        assert!(*bal >= wager, EINVALID_STATUS);
        *bal = *bal - wager;

        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = PvPLobby {
            id: state.next_id,
            creator: creator_addr,
            opponent: @0x0,
            enemy_id,
            wager,
            creator_score: 0,
            opponent_score: 0,
            status: STATUS_OPEN,
        };
        vector::push_back(&mut state.lobbies, lobby);
        state.next_id = state.next_id + 1;
    }

    /// Join an open lobby by matching the wager.
    public entry fun join_lobby(
        opponent: &signer,
        lobby_id: u64,
    ) acquires PvPState, ClashBalances {
        let opponent_addr = signer::address_of(opponent);
        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = find_lobby_mut(&mut state.lobbies, lobby_id);

        assert!(lobby.status == STATUS_OPEN, EINVALID_STATUS);
        assert!(opponent_addr != lobby.creator, ECANNOT_JOIN_OWN);

        // Deduct wager from opponent balance
        let cb = borrow_global_mut<ClashBalances>(@clash_of_prompt);
        let bal = simple_map::borrow_mut(&mut cb.balances, &opponent_addr);
        assert!(*bal >= lobby.wager, EINVALID_STATUS);
        *bal = *bal - lobby.wager;

        lobby.opponent = opponent_addr;
        lobby.status = STATUS_JOINED;
    }

    /// Admin submits a player's score for a lobby.
    public entry fun submit_result(
        admin: &signer,
        lobby_id: u64,
        player: address,
        score: u64,
    ) acquires PvPState {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = find_lobby_mut(&mut state.lobbies, lobby_id);
        assert!(lobby.status == STATUS_JOINED, EINVALID_STATUS);

        if (player == lobby.creator) {
            lobby.creator_score = score;
        } else {
            lobby.opponent_score = score;
        };
    }

    /// Settle the lobby: winner takes the pot minus 5% burn.
    public entry fun settle(
        admin: &signer,
        lobby_id: u64,
    ) acquires PvPState, ClashBalances {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = find_lobby_mut(&mut state.lobbies, lobby_id);
        assert!(lobby.status == STATUS_JOINED, EINVALID_STATUS);
        assert!(lobby.creator_score > 0 && lobby.opponent_score > 0, ESCORES_NOT_READY);

        let total_pot = lobby.wager * 2;
        let burn_amount = total_pot / 20; // 5%
        let payout = total_pot - burn_amount;

        // Determine winner (creator wins ties)
        let winner = if (lobby.creator_score >= lobby.opponent_score) {
            lobby.creator
        } else {
            lobby.opponent
        };

        // Pay winner
        let cb = borrow_global_mut<ClashBalances>(@clash_of_prompt);
        if (simple_map::contains_key(&cb.balances, &winner)) {
            let bal = simple_map::borrow_mut(&mut cb.balances, &winner);
            *bal = *bal + payout;
        } else {
            simple_map::add(&mut cb.balances, winner, payout);
        };

        lobby.status = STATUS_SETTLED;
    }

    // --- Helpers ---------------------------------------------------------------

    fun find_lobby_mut(lobbies: &mut vector<PvPLobby>, lobby_id: u64): &mut PvPLobby {
        let len = vector::length(lobbies);
        let i = 0u64;
        while (i < len) {
            let lobby = vector::borrow_mut(lobbies, i);
            if (lobby.id == lobby_id) {
                return lobby
            };
            i = i + 1;
        };
        abort ELOBBY_NOT_FOUND
    }
}

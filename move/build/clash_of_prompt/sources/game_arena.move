module clash_of_prompt::game_arena {
    use std::signer;
    use std::vector;
    use initia_std::block;
    use initia_std::fungible_asset;
    use clash_of_prompt::clash_token;

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

    fun init_module(admin: &signer) {
        move_to(admin, Leaderboard { entries: vector::empty() });
        move_to(admin, PvPState { lobbies: vector::empty(), next_id: 0 });
    }

    // --- Leaderboard ------------------------------------------------------

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

    // --- PvP Lobbies ------------------------------------------------------

    /// Create a new PvP lobby and lock the wager.
    public entry fun create_lobby(
        creator: &signer,
        enemy_id: u64,
        wager: u64,
    ) acquires PvPState {
        let creator_addr = signer::address_of(creator);

        // Lock wager tokens from creator
        let fa = clash_token::withdraw_with_ref(creator_addr, wager);
        // Deposit to module account as escrow
        clash_token::deposit_with_ref(@clash_of_prompt, fa);

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
    ) acquires PvPState {
        let opponent_addr = signer::address_of(opponent);
        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = find_lobby_mut(&mut state.lobbies, lobby_id);

        assert!(lobby.status == STATUS_OPEN, EINVALID_STATUS);
        assert!(opponent_addr != lobby.creator, ECANNOT_JOIN_OWN);

        // Lock matching wager
        let fa = clash_token::withdraw_with_ref(opponent_addr, lobby.wager);
        clash_token::deposit_with_ref(@clash_of_prompt, fa);

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
    ) acquires PvPState {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let state = borrow_global_mut<PvPState>(@clash_of_prompt);
        let lobby = find_lobby_mut(&mut state.lobbies, lobby_id);
        assert!(lobby.status == STATUS_JOINED, EINVALID_STATUS);
        assert!(lobby.creator_score > 0 && lobby.opponent_score > 0, ESCORES_NOT_READY);

        let total_pot = lobby.wager * 2;
        let burn_amount = total_pot / 20; // 5%
        let _payout = total_pot - burn_amount;

        // Determine winner (creator wins ties)
        let winner = if (lobby.creator_score >= lobby.opponent_score) {
            lobby.creator
        } else {
            lobby.opponent
        };

        // Withdraw pot from escrow (module account)
        let pot_fa = clash_token::withdraw_with_ref(@clash_of_prompt, total_pot);

        // Split: burn 5%, send rest to winner
        let burn_fa = fungible_asset::extract(&mut pot_fa, burn_amount);
        clash_token::burn_fa(burn_fa);
        clash_token::deposit_with_ref(winner, pot_fa);

        lobby.status = STATUS_SETTLED;
    }

    // --- Helpers -----------------------------------------------------------

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

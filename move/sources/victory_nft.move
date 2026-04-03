module clash_of_prompt::victory_nft {
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use initia_std::collection;
    use initia_std::nft;
    use initia_std::object;

    /// Only the module publisher can call this function.
    const ENOT_ADMIN: u64 = 1;

    const COLLECTION_NAME: vector<u8> = b"Clash of Prompt Victories";
    const COLLECTION_DESC: vector<u8> = b"Victory NFTs from Clash of Prompt battles";
    const COLLECTION_URI: vector<u8> = b"";

    struct NftState has key {
        next_token_id: u64,
    }

    /// On-chain victory metadata stored alongside each NFT object.
    struct VictoryData has key {
        enemy_name: String,
        score: u64,
        turns: u64,
        avg_creativity: u64,
        image_url: String,
    }

    fun init_module(admin: &signer) {
        // Create an unlimited collection
        collection::create_unlimited_collection(
            admin,
            string::utf8(COLLECTION_DESC),
            string::utf8(COLLECTION_NAME),
            option::none(), // no royalty
            string::utf8(COLLECTION_URI),
        );

        move_to(admin, NftState { next_token_id: 0 });
    }

    /// Mint a victory NFT with battle stats as on-chain properties.
    public entry fun mint_victory(
        admin: &signer,
        to: address,
        enemy_name: String,
        score: u64,
        turns: u64,
        avg_creativity: u64,
        image_url: String,
    ) acquires NftState {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);

        let state = borrow_global_mut<NftState>(@clash_of_prompt);
        let token_id = state.next_token_id;
        state.next_token_id = token_id + 1;

        // Build description with battle stats
        let description = string::utf8(b"Victory over ");
        string::append(&mut description, enemy_name);

        let collection_obj = object::address_to_object<collection::Collection>(
            collection::create_collection_address(&@clash_of_prompt, &string::utf8(COLLECTION_NAME))
        );

        // Mint the NFT under the admin signer; token_id is a unique string
        let token_id_str = u64_to_string(token_id);
        let constructor_ref = nft::create(
            admin,
            collection_obj,
            description,
            token_id_str,
            option::none(), // no royalty
            image_url,
        );

        // Store victory data as a resource on the NFT object
        let nft_signer = object::generate_signer(&constructor_ref);
        move_to(&nft_signer, VictoryData {
            enemy_name,
            score,
            turns,
            avg_creativity,
            image_url: string::utf8(b""),
        });

        // Transfer the NFT to the recipient
        nft::transfer(admin, collection_obj, u64_to_string(token_id), to);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    fun u64_to_string(val: u64): String {
        if (val == 0) {
            return string::utf8(b"0")
        };
        let bytes = vector::empty<u8>();
        let n = val;
        while (n > 0) {
            let digit = ((n % 10) as u8) + 48; // ASCII '0' = 48
            vector::insert(&mut bytes, 0, digit);
            n = n / 10;
        };
        string::utf8(bytes)
    }
}

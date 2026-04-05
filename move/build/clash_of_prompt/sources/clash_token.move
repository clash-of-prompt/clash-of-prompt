module clash_of_prompt::clash_token {
    use std::option;
    use std::signer;
    use std::string;
    use initia_std::fungible_asset::{Self, MintRef, BurnRef, TransferRef, Metadata};
    use initia_std::object::{Self, Object};
    use initia_std::primary_fungible_store;

    friend clash_of_prompt::game_arena;

    /// Only the module publisher can call this function.
    const ENOT_ADMIN: u64 = 1;

    /// Seed used to create the metadata object.
    const ASSET_SEED: vector<u8> = b"CLASH";

    struct TokenRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
        transfer_ref: TransferRef,
    }

    fun init_module(admin: &signer) {
        let constructor_ref = object::create_named_object(admin, ASSET_SEED);

        fungible_asset::add_fungibility(
            &constructor_ref,
            option::none(),                              // no max supply
            string::utf8(b"Clash Token"),                // name
            string::utf8(b"CLASH"),                      // symbol
            6,                                           // decimals
            string::utf8(b""),                           // icon_uri
            string::utf8(b""),                           // project_uri
        );

        let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(&constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(&constructor_ref);

        move_to(admin, TokenRefs { mint_ref, burn_ref, transfer_ref });
    }

    /// Return the metadata object for the CLASH token.
    public fun metadata(): Object<Metadata> {
        let addr = object::create_object_address(&@clash_of_prompt, ASSET_SEED);
        object::address_to_object<Metadata>(addr)
    }

    /// Mint CLASH tokens to `to`. Only the module publisher can call this.
    public entry fun mint(
        admin: &signer,
        to: address,
        amount: u64,
    ) acquires TokenRefs {
        assert!(signer::address_of(admin) == @clash_of_prompt, ENOT_ADMIN);
        let refs = borrow_global<TokenRefs>(@clash_of_prompt);
        primary_fungible_store::mint(&refs.mint_ref, to, amount);
    }

    /// Burn CLASH tokens from the caller's own balance.
    public entry fun burn(
        account: &signer,
        amount: u64,
    ) acquires TokenRefs {
        let refs = borrow_global<TokenRefs>(@clash_of_prompt);
        primary_fungible_store::burn(&refs.burn_ref, signer::address_of(account), amount);
    }

    /// Withdraw CLASH from `from` using the transfer ref (used internally by game_arena).
    public(friend) fun withdraw_with_ref(from: address, amount: u64): fungible_asset::FungibleAsset acquires TokenRefs {
        let refs = borrow_global<TokenRefs>(@clash_of_prompt);
        primary_fungible_store::withdraw_with_ref(&refs.transfer_ref, from, amount)
    }

    /// Deposit CLASH to `to` using the transfer ref (used internally by game_arena).
    public(friend) fun deposit_with_ref(to: address, fa: fungible_asset::FungibleAsset) acquires TokenRefs {
        let refs = borrow_global<TokenRefs>(@clash_of_prompt);
        primary_fungible_store::deposit_with_ref(&refs.transfer_ref, to, fa);
    }

    /// Burn a FungibleAsset value directly (used internally by game_arena for the 5% burn).
    public(friend) fun burn_fa(fa: fungible_asset::FungibleAsset) acquires TokenRefs {
        let refs = borrow_global<TokenRefs>(@clash_of_prompt);
        fungible_asset::burn(&refs.burn_ref, fa);
    }
}

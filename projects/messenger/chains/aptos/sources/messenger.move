/// A simple contracts that demonstrates how to send messages with wormhole.
module core_messages::messenger {
    use wormhole::wormhole;
    use aptos_framework::coin;
    use std::table::{Self, Table};
    use wormhole::u16::U16;
    use wormhole::external_address::ExternalAddress;
    use aptos_framework::signer;
    use aptos_framework::account;
    use std::string::{Self, String};

    const E_ONLY_CORE_MESSAGES_CAN_INIT:u64 = 0;
    const E_ONLY_ADMIN:u64 = 1;
    const E_VAA_ALREADY_CONSUMED:u64 = 2;
    const E_VAA_EMMITTER_NOT_REGISTERED:u64 = 3;

    struct MessengerAdminCapability has key {
        // The ability to make changes to the State Resource Account
        resource_signer_cap: account::SignerCapability,
    }

    struct State has key {
        // Admin Address
        admin: address, 

        // The ability to send wormhole messages
        emitter_cap: wormhole::emitter::EmitterCapability,

        // Mapping of bridge contracts on other chains
        registered_emitters: Table<U16, ExternalAddress>,

        // Current Message
        current_message: String,

        // Consumed VAAs
        consumed_vaas: Table<vector<u8>, bool>,
    }

    public entry fun init_messenger(core_messages: &signer, admin: address) {
        // Requires the private key of Core Messages to have signed this message
        // This is to make sure the state get stored under core messages resource account
        assert!(signer::address_of(core_messages) == @core_messages, E_ONLY_CORE_MESSAGES_CAN_INIT);

        let (resource_signer, signer_cap) = account::create_resource_account(core_messages, b"messenger_state");

        // Register ourselves as a wormhole emitter. This gives back an
        // `EmitterCapability` which will be required to send messages through
        // wormhole.
        let emitter_cap = wormhole::register_emitter();
        move_to(&resource_signer, State { 
            admin, 
            emitter_cap, 
            registered_emitters: table::new(), 
            current_message: string::utf8(b"uninitalized"), 
            consumed_vaas: table::new()
        });
        move_to(core_messages, MessengerAdminCapability { resource_signer_cap: signer_cap } );
    }

    public entry fun send_message(user: &signer, payload: vector<u8>) acquires State {
        // Fetch the Resource Account that has state
        let state_resource_account = account::create_resource_address(&@core_messages, b"messenger_state");

        // Retrieve emitter capability from the state
        let emitter_cap = &mut borrow_global_mut<State>(state_resource_account).emitter_cap;

        // Set nonce to 0 (this field is not interesting for regular messages,
        // only batch VAAs)
        let nonce: u64 = 0;

        let message_fee = wormhole::state::get_message_fee();
        let fee_coins = coin::withdraw(user, message_fee);

        let _sequence = wormhole::publish_message(
            emitter_cap,
            nonce,
            payload,
            fee_coins
        );
    }

    public entry fun register_emitter(user:&signer, chainID: u64, external_address:vector<u8>) acquires State {

        let chain_id = wormhole::u16::from_u64(chainID);
        let foreign_address = wormhole::external_address::from_bytes(external_address);

        // Fetch the Resource Account that has state
        let state_resource_account = account::create_resource_address(&@core_messages, b"messenger_state");

        // Retrieve emitter capability from the state
        let admin_address = &borrow_global<State>(state_resource_account).admin;
        assert!(*admin_address == signer::address_of(user), E_ONLY_ADMIN);

        //Get Registered Emitters
        let state = borrow_global_mut<State>(state_resource_account);
        table::upsert(&mut state.registered_emitters, chain_id, foreign_address);
    }

    public entry fun receive_message(vaa_bytes: vector<u8>) acquires State {
        // Verify the wormhole message
        let vaa = wormhole::vaa::parse_and_verify(vaa_bytes);
        
        // Fetch the Resource Account that has state
        let state_resource_account = account::create_resource_address(&@core_messages, b"messenger_state");
        let state = borrow_global_mut<State>(state_resource_account);

        // Check the VAA has not been consumed already
        assert!(!table::contains(&state.consumed_vaas, wormhole::vaa::get_hash(&vaa)), E_VAA_ALREADY_CONSUMED);

        // Check the emitter chain is registered
        assert!(*table::borrow(&state.registered_emitters, wormhole::vaa::get_emitter_chain(&vaa)) == wormhole::vaa::get_emitter_address(&vaa), E_VAA_EMMITTER_NOT_REGISTERED);

        // Set the current message to the vaa message
        state.current_message = string::utf8(wormhole::vaa::get_payload(&vaa));

        // Store the hash of the vaa in the consumed VAAs
        table::upsert(&mut state.consumed_vaas, wormhole::vaa::get_hash(&vaa), true);

        wormhole::vaa::destroy(vaa);
    }
}
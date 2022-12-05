/// A simple contracts that demonstrates how to send messages with wormhole.
module core_messages::messenger {
    use wormhole::wormhole;
    use aptos_framework::coin;

    struct State has key {
        emitter_cap: wormhole::emitter::EmitterCapability,
    }

    public entry fun init_messenger(core_messages: &signer) {
        // Register ourselves as a wormhole emitter. This gives back an
        // `EmitterCapability` which will be required to send messages through
        // wormhole.
        let emitter_cap = wormhole::register_emitter();
        move_to(core_messages, State { emitter_cap });
    }

    public entry fun send_message(user: &signer, payload: vector<u8>) acquires State {
        // Retrieve emitter capability from the state
        let emitter_cap = &mut borrow_global_mut<State>(@core_messages).emitter_cap;

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
}
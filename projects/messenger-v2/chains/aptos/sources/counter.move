/*
module core_messages::counter {
    struct Counter has key, store {
        count: u64
    }

    public entry fun init_counter(counter: &signer) {
        //use aptos_framework::account;
        //let (counter_acc, _) = account::create_resource_account(messenger, b"Counter");
        move_to(counter, Counter { count: 0} );
    }

    public entry fun increment() acquires Counter {
        let counter = borrow_global_mut<Counter>(@core_messages); 
        counter.count = counter.count + 1;
    }
}
*/

# Registering Emitters

While not strictly required,  when writing xDapps it's important to listen for messages from *specific* apps on other chains, otherwise attacks could create fake applications that emit messages that *look* like what we expect, but have fake payloads. 

To do this, we register the sending contract's addresses with the receiving contracts. Because each VAA has the contract address that asked the core bridge to *emit* the VAA, we call the sending contracts *emitters*. Additionally, the emitters you're listening to *do not* need to be your own contracts. You might want to listen to the emits of a different xDapp, in which case you'd register its address in your code. 

Then, when receiving messages, we can check the VAA being submitted to make sure it came from one of the contracts we were expecting and *from the chain* we were expecting.

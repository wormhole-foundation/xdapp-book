# Registering Emitters

This is not strictly required, but when writing xDapps, you want to listen for messages from *specific* apps on other chains, otherwise attacks could create fake applications that emit messages that *look* like what we expect, but have fake payloads. 

To do this, we register the sending contract's addresses with the receving contracts. Because each VAA has the contract address asked the core bridge to *emit* the VAA, we call the sending contracts *emitters*. Also, the emitters you're listening too, *do not* need to be your own contracts. You might want to listen to the emits of a different xDapp, in which case you'd register it's address in your code. 

Then, when receving messages, we can check the VAA being submitted, and make sure that the VAA being submitted came from one of the contracts we were expecting and *from the chain* we were expecting.
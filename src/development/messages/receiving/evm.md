# Receiving Messages on EVM

To receive messages in EVM, first we need to implement a function `receiveMsg`. The name of this function is arbitrary, so any function name will work as long as your relayer knows what to call on the application contract when submitting messages. 

This function will take in an encoded set of `bytes` as the VAA and then call the `parseAndVerifyVM` function on the Core Bridge to validate the message.

```solidity

    function receiveEncodedMsg(bytes memory encodedMsg) public {
        (IWormhole.VM memory vm, bool valid, string memory reason) = core_bridge.parseAndVerifyVM(encodedMsg);
        
        //1. Check Wormhole Guardian Signatures
        //  If the VM is NOT valid, will return the reason it's not valid
        //  If the VM IS valid, reason will be blank
        require(valid, reason);

        //2. Check if the Emitter Chain contract is registered
        require(_applicationContracts[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");
    
        //3. Check that the message hasn't already been processed
        require(!_completedMessages[vm.hash], "Message already processed");
        _completedMessages[vm.hash] = true;

        //Process the message. In this case, we just store the string in the VAA to storage
        current_msg = string(vm.payload);
    }

```

# Best Practices

The Wormhole contracts were designed in a manner such that composeability is the default, but maximizing composeability requires that xDapp developers follow certain conventions around the sending and receiving of messages.

# Sending Messages

When sending messages, you should follow the same paradigm as is used by the Wormhole modules, namely

- Don't couple the message emission to the message delivery
- Pass through all the optional arguments (like nonce)
- Always return the sequence

### Good Example

```solidity
// This function defines a super simple Wormhole 'module'.
// A module is just a piece of code which knows how to emit a composeable message
// which can be utilized by other contracts.
function emitMyMessage(address intendedRecipient, uint32 nonce)
        public returns (uint64 sequence) {

    // Nonce is passed though to the core bridge.
    // This allows other contracts to utilize it for batching or processing.

    // intendedRecipient is key for composeability!
    // This field will allow the destination contract to enforce
    // that the correct contract is submitting this VAA.

    // 1 is the consistency level,
    // this message will be emitted after only 1 confirmation
    sequence = core_bridge.publishMessage(nonce, "My Message to " + intendedRecipient, 1);

    // The sequence is passed back to the caller, which can be useful relay information.
    // Relaying is not done here, because it would 'lock' others into the same relay mechanism.
}

// This portion of the code which deals with composition and delivery.
// Its job is to string together multiple modules, and ensure they get relayed
// This code can be private or public, because it's tightly coupled to application.
// Do whatever you need to here.
function sendMyMessage() private {

    // First, emit a message intended for MY_OTHER_CONTRACT with nonce zero.
    // Because processMyMessage enforces that msg.sender must equal the intendedRecipient,
    // no one but MY_OTHER_CONTRACT will be able to call processMyMessage
    // with the message emitted from this transaction.

    // However, another contract could call emitMyMessage in a different transaction
    // using their own address as the recipient.

    // This allows for composeability of the module logic while still being secure!

    emitMyMessage(MY_OTHER_CONTRACT, 0);

    // Suppose I also want to send tokens to my contract on the OTHER_CHAIN
    // Because transferTokensWithPayload is a composeable message, I can include it.
    // Because the nonce of both these messages is 0, they will be combined into a batch VAA.
    // NOTE: transferTokens (the basic transfer) is NOT considered a composeable message

    token_bridge.transferTokensWithPayload(SOME_TOKEN, SOME_AMOUNT, OTHER_CHAIN, MY_OTHER_CONTRACT,
    0, null);

    // Lastly, I request that the batch for nonce 0 be delivered to MY_OTHER_CONTRACT
    relayer_contract.requestDelivery(OTHER_CHAIN, MY_OTHER_CONTRACT, 0, getRelayerFeeAmount());
}
```

# Receiving Messages

The best practices for receiving messages employ similar concepts. You should keep in mind that other contracts might want to integrate with your specific logic. As such, you shouldn't tie your verification logic to the delivery mechanism of your VAAs, and you should also give external integrators a safe way to compose with your module.

### **_Critical!_**

- Always verify that the emitterAddress of the VAA comes from a contract you trust.

- If the message should not be allowed to be 'replayed', immediately mark its hash as processed.
- If your VAAs aren't replayable, you almost always want to include and enforce an intended recipient. Otherwise anyone can call your verify function directly with the single VAA, which will make life much harder for you and your integrators who want to process multiple VAAs at once. This is referred to as a 'scoop' exploit.

### Composeability

- When processing a VAA, always treat the messages as single VAAs. Destructuring batch VAAs is the responsibility of the integrator.
- Once you have the function written to verify your message, pretend you are an external integrator.

### Good Example

```
// Verification accepts a single VAA, and is publicly callable.
function processMyMessage(bytes32 memory VAA) public {

    (IWormhole.VM memory vm, bool valid, string memory reason) =
        core_bridge.parseAndVerifyVM(VAA);

    // Ensure core contract verification succeeded.
    require(valid, reason);

    // Ensure the emitterAddress of this VAA is a trusted address
    require(myTrustedContracts[vm.emitterChainId] ==
        vm.emitterAddress, "Invalid Emitter Address!");

    // Check that the VAA hasn't already been processed (replay protection)
    require(!processedMessages[vm.hash], "Message already processed");

    // Check that the contract which is processing this VAA is the intendedRecipient
    // If the two aren't equal, this VAA may have bypassed its intended entrypoint.
    // This exploit is referred to as 'scooping'.
    require(parseIntendedRecipient(vm.payload) == msg.sender);

    // Add the VAA to processed messages so it can't be replayed
    processedMessages[vm.hash] = true

    // The message content can now be trusted.
    doBusinessLogic(vm.payload)
}

//This is the function which would receive the the VAA from the relayer
function receiveVAA(bytes32 memory batchVAA) public {
    // First, call the core bridge to verify the batchVAA
    // All the individual VAAs inside the batchVAA will be cached,
    // and you will receive headless VAAs inside the VM2 object.
    // Headless VAAs are verifiable by parseAndVerifyVM.

    (IWormhole.VM2 memory vm2, bool valid, string memory reason) =
        core_bridge.parseAndVerifyBatchVM(batchVAA, true)

    // I know from sendMyMessage that the first VAA is a token bridge VAA,
    // so let's hand that off to the token bridge module.
    bytes vaaData = token_bridge.completeTransferWithPayload(vm2.payloads[0])

    // The second VAA is my message, let's hand that off to my module.
    processMyMessage(vm2.payloads[1])
}
```

<!--
TODO these are not actually functioning examples and some of the interactions are incorrect. Demonstrates the concept.
>

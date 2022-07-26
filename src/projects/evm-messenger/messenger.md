# Messenger.sol
Messenger.sol is an application contract on EVM capable of communicating with the Wormhole core bridge. 

Start by hard coding the Wormhole core bridge address, and creating a interfaced link to it. 

```solidity
//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Wormhole/IWormhole.sol";

contract Messenger {
    string private current_msg;
    address private wormhole_core_bridge_address = address(0xC89Ce4735882C9F0f0FE26686c53074E09B0D550);
    IWormhole core_bridge = IWormhole(wormhole_core_bridge_address);

    // Used to calculate the Sequence for each message sent from this contract    
    uint32 nonce = 0;
    // Chain ID => Application Contract mapping to ensure we only process messages from contracts we want to.
    mapping(uint16 => bytes32) _applicationContracts;
    address owner;
    // Track which messages we've already processed so we don't double process messages.
    mapping(bytes32 => bool) _completedMessages;
}

```

## Constructor
This sets the owner of the contract to the deployer. The owner is used later to register sibling contracts on foreign chains.

```solidity

constructor(){
    owner = msg.sender;
}

```

## SendMsg
This takes in a bytes payload and calls the Wormhole Core Bridge to publish the bytes as a message. 

The `publishMessage()` function of the core_bridge take three arguements: 
- Nonce: a number to uniquely identify this message, used to make sure that the target chain doesn't double process the same message
- Payload: the bytes payload
- Confirmations: the number of blocks the guardians should wait before signing this VAA. For low security applications, this number can be low, but if you're on a chain that often reorgs a high number of blocks (like Polygon) you might want to set this number high enough to ensure your transaction from the source chain doesn't get lost after the guardians sign it.

```solidity
function sendMsg(bytes memory str) public returns (uint64 sequence) {
    sequence = core_bridge.publishMessage(nonce, str, 1);
    nonce = nonce+1;
}
```

## ReceiveEncodedMsg
The receive encoded message takes in a VAA as bytes. Then it calls the Core Bridge to verify the signatures match those of the gaurdians, check that it's from a contract on a foreign chain that we actually want to listen to and that the message hasn't been processed already. If all those checks pass, we can decode the payload (in this case we know it's a string) and set the current_msg for the contract to that payload.

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

    //Do the thing
    current_msg = string(vm.payload);
}


```

## GetCurrentMsg
A simple method that returns the current stored message.

```solidity

function getCurrentMsg() public view returns (string memory){
    return current_msg;
}

```

## RegisterApplicationContracts
It's typically a good idea to register and track the contracts from foreign chains that you're accepting VAAs from, as anyone could deploy a contract and generate a fake VAA that looks like a real VAA you'd want to accept. 

```solidity

/**
    Registers it's sibling applications on other chains as the only ones that can send this instance messages
    */
function registerApplicationContracts(uint16 chainId, bytes32 applicationAddr) public {
    require(msg.sender == owner, "Only owner can register new chains!");
    _applicationContracts[chainId] = applicationAddr;
}

```

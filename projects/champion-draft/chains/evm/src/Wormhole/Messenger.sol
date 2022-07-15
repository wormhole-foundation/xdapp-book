//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IWormhole.sol";

contract Messenger {
    string private current_msg;
    address private wormhole_core_bridge_address;
    IWormhole core_bridge;
    uint32 nonce = 0;
    mapping(uint16 => bytes32) _applicationContracts;
    address owner;
    mapping(bytes32 => bool) _completedMessages;

    constructor(address _wormhole_core_bridge_address){
        owner = msg.sender;
        wormhole_core_bridge_address = _wormhole_core_bridge_address;
        core_bridge = IWormhole(wormhole_core_bridge_address);
        // wormhole_core_bridge_address = address(0xC89Ce4735882C9F0f0FE26686c53074E09B0D550);
    }

    function sendMsg(bytes memory str) public returns (uint64 sequence) {
        require(msg.sender == owner, "Only owner can receive messages!");
        sequence = core_bridge.publishMessage(nonce, str, 1);
        nonce = nonce+1;
    }

    function receiveEncodedMsg(bytes memory encodedMsg) public view returns (string memory) {
        require(msg.sender == owner, "Only owner can receive messages!");
        (IWormhole.VM memory vm, bool valid, string memory reason) = core_bridge.parseAndVerifyVM(encodedMsg);
        
        //1. Check Wormhole Guardian Signatures
        //  If the VM is NOT valid, will return the reason it's not valid
        //  If the VM IS valid, reason will be blank
        require(valid, reason);

        //2. Check if the Emitter Chain contract is registered
        // require(_applicationContracts[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");
    
        //3. Check that the message hasn't already been processed
        // require(!_completedMessages[vm.hash], "Message already processed");
        // _completedMessages[vm.hash] = true;

        //Do the thing
        return string(vm.payload);
    }

    function receiveEncodedMsgOnce(bytes memory encodedMsg) public view returns (string memory, bytes32 vm_hash) {
        require(msg.sender == owner, "Only owner can receive messages!");
        (IWormhole.VM memory vm, bool valid, string memory reason) = core_bridge.parseAndVerifyVM(encodedMsg);
        
        //1. Check Wormhole Guardian Signatures
        //  If the VM is NOT valid, will return the reason it's not valid
        //  If the VM IS valid, reason will be blank
        require(valid, reason);

        //2. Check if the Emitter Chain contract is registered
        // require(_applicationContracts[vm.emitterChainId] == vm.emitterAddress, "Invalid Emitter Address!");
    
        //3. Check that the message hasn't already been processed
        // require(!_completedMessages[vm.hash], "Message already processed");
        // _completedMessages[vm.hash] = true;

        return (string(vm.payload), vm.hash);
    }

    // function allowVaaResubmit(bytes32 vm_hash) public {
    //     require(msg.sender == owner, "Only owner can allow resubmission of vaa!");
    //     _completedMessages[vm_hash] = false;
    // }

    /**
        Registers it's sibling applications on other chains as the only ones that can send this instance messages
     */
    function registerApplicationContracts(uint16 chainId, bytes32 applicationAddr) public {
        require(msg.sender == owner, "Only owner can register new chains!");
        _applicationContracts[chainId] = applicationAddr;
    }
}

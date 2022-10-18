// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.0;

import "./XID.sol"; 

contract HomeRegistrar {
    XID xid;
    bytes32 rootNode;

    modifier only_owner(bytes32 label) {
        address currentOwner = xid.owner(keccak256(abi.encodePacked(rootNode, label)));
        require(currentOwner == address(0x0) || currentOwner == msg.sender);
        _;
    }

    constructor(XID xidAddr, bytes32 node){
        xid = xidAddr;
        rootNode = node;
    }

    /**
        Registers label to the first account that claims it.
     */
    function register(bytes32 label, address owner) public only_owner(label) {
        xid.setSubnodeOwner(rootNode, label, owner);
    }
}
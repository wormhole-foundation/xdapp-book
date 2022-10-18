// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.0;

interface XID {
    // Logged when the owner of a node transfers ownership to a new account.
    event Transfer(bytes32 indexed node, address owner);
    // Logged when the owner of a node assigns a new owner to a subnode.
    event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
    
    function owner(bytes32 node) external view returns (address);
    function setOwner(bytes32 node, address owner) external;
    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external returns(bytes32);
}
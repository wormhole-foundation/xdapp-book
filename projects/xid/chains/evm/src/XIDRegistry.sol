// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.0;

import "./XID.sol";
contract XIDRegistry is XID {

    struct Record {
        address owner;
        // WormholeChainId => Address Attestation
        mapping(uint16 => bytes32[]) wallets;
        // Web2 Attestations
        mapping(string => Link) links;
        uint64 ttl;
    }

    struct Link {
        string service;
        string proof_link;
    }

    mapping(bytes32 => Record) records;
    mapping (address => mapping(address => bool)) operators;

    // Permits modifications only by the owner of the specified node.
    modifier authorised(bytes32 node) {
        address owner = records[node].owner;
        require(owner == msg.sender || operators[owner][msg.sender]);
        _;
    }

    /**
     * @dev Constructs a new XID Registry.
     */
    constructor() public {
        records[0x0].owner = msg.sender;
    }

    /**
     * @dev Returns the address that owns the specified node.
     * @param node The specified node.
     * @return address of the owner.
     */
    function owner(bytes32 node) public virtual override view returns (address) {
        address addr = records[node].owner;
        if (addr == address(this)) {
            return address(0x0);
        }

        return addr;
    }

    /**
     * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.
     * @param node The node to transfer ownership of.
     * @param owner The address of the new owner.
     */
    function setOwner(bytes32 node, address owner) public virtual override authorised(node) {
        _setOwner(node, owner);
        emit Transfer(node, owner);
    }

    function _setOwner(bytes32 node, address owner) internal virtual {
        records[node].owner = owner;
    }

    /**
     * @dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.
     * @param node The parent node.
     * @param label The hash of the label specifying the subnode.
     * @param owner The address of the new owner.
     */
    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public virtual override authorised(node) returns(bytes32) {
        bytes32 subnode = keccak256(abi.encodePacked(node, label));
        _setOwner(subnode, owner);
        emit NewOwner(node, label, owner);
        return subnode;
    }
}
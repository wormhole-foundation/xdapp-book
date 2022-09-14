# NFT Layer

This is the interface for applications to interact with Wormhole's NFT Bridge Contract to publish messages or verify and parse a received message.

```
// contracts/NFTBridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./NFTBridgeGetters.sol";

interface INFTBridge is NFTGetters {

    function transferNFT(address token, uint256 tokenID, uint16 recipientChain, bytes32 recipient, uint32 nonce) external payable returns (uint64 sequence);

    function completeTransfer(bytes memory encodeVm) external ;

    function encodeTransfer(NFTBridgeStructs.Transfer memory transfer) external pure returns (bytes memory encoded);

    function parseTransfer(bytes memory encoded) external pure returns (NFTBridgeStructs.Transfer memory transfer);

    function onERC721Received(address operator, address, uint256, bytes calldata) external view returns (bytes4);

}

```
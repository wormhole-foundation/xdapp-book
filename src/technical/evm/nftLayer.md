# NFT Layer

This section will explain how to properly interact with the NFT Layer in an EVM ecosystem.

```
// contracts/NFTBridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./NFTBridgeGetters.sol";
import "./NFTBridgeStructs.sol";

interface INFTBridge is NFTGetters {

    function transferNFT(address token, uint256 tokenID, uint16 recipientChain, bytes32 recipient, uint32 nonce) external payable returns (uint64 sequence);

    function completeTransfer(bytes memory encodeVm) external ;

    function encodeTransfer(NFTBridgeStructs.Transfer memory transfer) external pure returns (bytes memory encoded);

    function parseTransfer(bytes memory encoded) external pure returns (NFTBridgeStructs.Transfer memory transfer);

    function onERC721Received(address operator, address, uint256, bytes calldata) external view returns (bytes4);

}

```

## Overview

Only ERC-721 supported, creates a wrapped NFT with identical metadata. Implementation varies by ecosystem

## Sending an NFT

- Unlike xAssets, there is no registration process
- Code example to send

## Receiving an NFT

- completeTransfer code examples

//TODO NFT verification and perhaps some other common usecases

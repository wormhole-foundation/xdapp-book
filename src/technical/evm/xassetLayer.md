# xAsset Layer

This is the interface for applications to interact with the xAsset layer in Wormhole

# Instantiating the interface

- Same as instantiating any other EVM interface / Core Layer / NFT Layer,

```
// contracts/Bridge.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./BridgeGetters.sol";

//TODO link to file in github so doesn't become stale
interface ITokenBridge is BridgeGetters {
    /*
     *  @dev Produce a AssetMeta message for a given token
     */
    function attestToken(address tokenAddress, uint32 nonce) external payable returns (uint64 sequence);

    /*
     *  @notice Send eth through portal by first wrapping it to WETH.
     */
    function wrapAndTransferETH(
        uint16 recipientChain,
        bytes32 recipient,
        uint256 arbiterFee,
        uint32 nonce
    ) external payable returns (uint64 sequence);

    /*
     *  @notice Send eth through portal by first wrapping it.
     *
     *  @dev This type of transfer is called a "contract-controlled transfer".
     *  There are three differences from a regular token transfer:
     *  1) Additional arbitrary payload can be attached to the message
     *  2) Only the recipient (typically a contract) can redeem the transaction
     *  3) The sender's address (msg.sender) is also included in the transaction payload
     *
     *  With these three additional components, xDapps can implement cross-chain
     *  composable interactions.
     */
    function wrapAndTransferETHWithPayload(
        uint16 recipientChain,
        bytes32 recipient,
        uint32 nonce,
        bytes memory payload
    ) external payable returns (uint64 sequence);

    /*
     *  @notice Send ERC20 token through portal.
     */
    function transferTokens(
        address token,
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint256 arbiterFee,
        uint32 nonce
    ) external payable returns (uint64 sequence);

    /*
     *  @notice Send ERC20 token through portal.
     *
     *  @dev This type of transfer is called a "contract-controlled transfer".
     *  There are three differences from a regular token transfer:
     *  1) Additional arbitrary payload can be attached to the message
     *  2) Only the recipient (typically a contract) can redeem the transaction
     *  3) The sender's address (msg.sender) is also included in the transaction payload
     *
     *  With these three additional components, xDapps can implement cross-chain
     *  composable interactions.
     */
    function transferTokensWithPayload(
        address token,
        uint256 amount,
        uint16 recipientChain,
        bytes32 recipient,
        uint32 nonce,
        bytes memory payload
    ) external payable returns (uint64 sequence);

    function updateWrapped(bytes memory encodedVm) external returns (address token);

    function createWrapped(bytes memory encodedVm) external returns (address token);

    /*
     * @notice Complete a contract-controlled transfer of an ERC20 token.
     *
     * @dev The transaction can only be redeemed by the recipient, typically a
     * contract.
     *
     * @param encodedVm    A byte array containing a VAA signed by the guardians.
     *
     * @return The byte array representing a BridgeStructs.TransferWithPayload.
     */
    function completeTransferWithPayload(bytes memory encodedVm) external returns (bytes memory);

    /*
     * @notice Complete a contract-controlled transfer of WETH, and unwrap to ETH.
     *
     * @dev The transaction can only be redeemed by the recipient, typically a
     * contract.
     *
     * @param encodedVm    A byte array containing a VAA signed by the guardians.
     *
     * @return The byte array representing a BridgeStructs.TransferWithPayload.
     */
    function completeTransferAndUnwrapETHWithPayload(bytes memory encodedVm) external returns (bytes memory);

    /*
     * @notice Complete a transfer of an ERC20 token.
     *
     * @dev The msg.sender gets paid the associated fee.
     *
     * @param encodedVm A byte array containing a VAA signed by the guardians.
     */
    function completeTransfer(bytes memory encodedVm) external ;

    /*
     * @notice Complete a transfer of WETH and unwrap to eth.
     *
     * @dev The msg.sender gets paid the associated fee.
     *
     * @param encodedVm A byte array containing a VAA signed by the guardians.
     */
    function completeTransferAndUnwrapETH(bytes memory encodedVm) external ;
}
```

## Registering New Tokens

- Only needs to be done once globally ever
- Reattesting will update metadata, can be done over and over
- Generally not done by the xDapp contract, but instead by an off-chain process or by hand
- Probably don't need code examples, as it's not advised to do this on chain for most usecases

## Basic Transfer

- Code example for transferring an ERC-20, explain all the args, WORMHOLE ADDRESSES
- Transferring native currency is a special case. Use transferETH for the native currency regardless of which EVM you are on.
- Use this only if you are transferring to an end user wallet. If you're transferring to a smart contract (which you control), use transferWithPayload instead. Explain why
- Mention public relayers, unwrapping conventions, fee schedule.

## Contract Controlled Transfer

- Differences when compared to a basic transfer: has a payload, can only be redeemed if msg.sender == the recipient, doesn't have a relayer fee field because of the redemption restriction.
- Always use this when the destination is a contract

## Redemption

### Basic Token Redemption

- completeTransfer for everything
- completeTransfer and unwrap Eth only for the case where unwrapping ETH is desired

### Contract Controlled Transfer redemption

- completeTransferWithPayload for everything,
- completeTransferAndUnwrapETH as a QoL function. Unwraps the ETH before giving it to the contract.

# Token Bridge

This section will explain how to properly interact with the Wormhole Token Bridge Module in an EVM ecosystem.

## Configuring the interface

[Here](https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/bridge/interfaces/ITokenBridge.sol) is the interface for applications to interact with Wormhole's Token Bridge.

Instantiating the interface will depend on your development ecosystem and blockchain. The Wormhole Token Bridge contract address is usually stored in your contract address.

Below is an example line of code to instantiate the interface for mainnet Ethereum:

```
address private wormhole_token_bridge_address = address(0x3ee18B2214AFF97000D974cf647E7C347E8fa585);
ITokenBridge token_bridge = ITokenBridge(wormhole_token_bridge_address);
```

## Registering New Tokens

Attesting a token from EVM needs to happen once per token as it will not be claimable until so. However, there are no restrictions to reattesting a token; repeat attestations will update the metadata.

It is not advised to attest tokens on-chain for most use cases. To attest a token by an off-chain process, you can either do it by hand through one of the Token Bridge UIs (for example [Portal](https://www.portalbridge.com/#/register)) or using the [Typescript SDK](https://www.npmjs.com/package/@certusone/wormhole-sdk).

_[Here](../../development/portal/evm/attestingToken.md) is an example of how to attest a token using the Typescript SDK._

## Basic Transfer

Basic transfer should only be used if you are transferring tokens to an end user wallet. If the end destination is a contract, you should only use Contract Controlled Transfers (described below).

It is important to note the transferring native currency is a special case of the Basic Transfer. As such, a different function call for initiating and completing a transfer is provided as a QoL improvement that will handle the wrapping and unwrapping of ETH.

To transfer a token, there are four steps:

1. Approve the Token Bridge to spend that token on our behalf.
   - _Note: Tokens in EVM usually denote up to 18 decimals places. However. Wormhole normalizes this to **8** decimals._

```
contractAddress.approve(token_bridge_address, amt);
```

2. Transfer the token to create the transfer VAA.
   - This function call will return a `sequence` (uint64) that is used in the VAA retrieval step.
   - _Note: For the recipient address, Wormhole addresses are 32 bytes for standardization across the different blockchains within the Wormhole ecosystem._

```
// To initiate transfer of normal ERC-20s
token_bridge.transferTokens(tokenAddress, amount, recipientChain, recipient, arbiterFee, nonce);

// To initiate transfer of native currency
token_bridge.wrapAndTransferETH(recipientChain, recipient, arbiterFee, nonce);
```

3. Retrieve the emitted VAA.
   - Basic Transfer VAAs are retrieved from the Guardian Network by the `emitterChainID`, `emitterAddress`, and `sequence`.

```js
const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
const vaaURL = `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
let vaaBytes = await (await fetch(vaaURL)).json();
while (!vaaBytes.vaaBytes) {
  console.log("VAA not found, retrying in 5s!");
  await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
  vaaBytes = await (await fetch(vaaURL)).json();
}
```

4. Complete the transfer using the VAA.

```
// To complete transfer of normal ERC-20s
token_bridge.completeTransfer(VAA);

// To complete transfer of native currency
completeTransferAndUnwrapETH(VAA);
```

## Contract Controlled Transfer

For any token transfers where the destination is a contract, you should always use Contract Controlled Transfers.

There are a few main differences between Contract Controlled Transfers and Basic Transfers:

- messages contains both tokens and an arbitrary payload
- messages can only be redeemed by a specified contract address
- messages do not have a relayer fee field because of the redemption restriction above

As was the case with Basic Transfers, transferring native currency is a special case for Contract Controlled Transfers as well. As such, similar QoL improvement functions are provided that handle the wrapping and unwrapping of ETH.

The process of sending a Contract Controlled Transfer is very similar to that of a Basic Transfer:

1. Approve the Token Bridge to spend that token on our behalf.
   - _Note: Tokens in EVM usually denote up to 18 decimals places. However. Wormhole normalizes this to **8** decimals._

```
contractAddress.approve(token_bridge_address, amt);
```

2. Transfer the token to create the transfer VAA.
   - This function call will return a `sequence` (uint64) that is used in the VAA retrieval step.
   - _Note: For the recipient address, Wormhole addresses are 32 bytes for standardization across the different blockchains within the Wormhole ecosystem._

```
// To initiate transfer of normal ERC-20s
token_bridge.transferTokensWithPayload(tokenAddress, amount, recipientChain, recipient, nonce, payload);

// To initiate transfer of native currency
token_bridge.wrapAndTransferETHWithPayload(recipientChain, recipient, nonce, payload);
```

3. Retrieve the emitted VAA.
   - Contract Controlled Transfer VAAs are retrieved from the Guardian Network by the `emitterChainID`, `emitterAddress`, and `sequence`.

```js
const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
const vaaURL = `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
let vaaBytes = await (await fetch(vaaURL)).json();
while (!vaaBytes.vaaBytes) {
  console.log("VAA not found, retrying in 5s!");
  await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
  vaaBytes = await (await fetch(vaaURL)).json();
}
```

4. Complete the transfer using the VAA.

```
// To complete transfer of normal ERC-20s
token_bridge.completeTransferWithPayload(VAA);

// To complete transfer of native currency
completeTransferAndUnwrapETHWithPayload(VAA);
```

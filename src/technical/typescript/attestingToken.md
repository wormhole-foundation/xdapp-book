# Registering Tokens

Registering tokens with the token bridge can be done from any supported blockchain, and only needs to be done once - globally - per token. This is is typically done via a UI (such as [Portal](portalbridge.com)) rather than done on-chain.

If you need to do it programmatically, you can also use the Typescript SDK to attest a token.

There are three steps to registering a token:

1. Create an AttestMeta VAA by calling `attest()` function from the SDK and passing in the Token Bridge address, and the address of the Token we want to attest.

For example, here is the code to produce an attestation VAA using ethers:

```js
const networkTokenAttestation = await attestFromEth(
  network.tokenBridgeAddress, // Token Bridge Address
  signer, //Private Key to sign and pay for TX + RPC Endpoint
  network.testToken //Token Address
);
```

The attestation transaction will produce a signed VAA. This signed VAA is necessary in order to register the tokens on other chains.

2. Retrieve the VAA with the `emitterAddress` of the Token Bridge and the `sequence` from the logs of the transaction receipt.

With those, you can fetch the VAA from any Guardian REST endpoint. It could take a moment (up to 30 seconds) for the Guardian to see and sign the VAA, so it's a good idea to poll the Guardian every few seconds until the VAA is found.

Here is a relatively compact piece of code which is able to fetch **any** VAA, given an emitter address and sequence number.

```js
const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
const seq = parseSequenceFromLogEth(
  networkTokenAttestation,
  network.bridgeAddress
);
const vaaURL = `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
console.log("Searching for: ", vaaURL);
let vaaBytes = await (await fetch(vaaURL)).json();
while (!vaaBytes.vaaBytes) {
  console.log("VAA not found, retrying in 5s!");
  await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
  vaaBytes = await (await fetch(vaaURL)).json();
}
```

3. Submit the VAA onto the target chain to create a wrapped version of the token by calling `createWrapped()`.

You can get the new wrapped token address by calling the `wrappedAsset()` function of the TokenBridge.

Here is how this can be accomplished using Ethers:

```js
await targetTokenBridge.createWrapped(
  Buffer.from(vaaBytes.vaaBytes, "base64"),
  {
    gasLimit: 2000000,
  }
);
await new Promise((r) => setTimeout(r, 5000)); //Time out to let block propagate
const wrappedTokenAddress = await targetTokenBridge.wrappedAsset(
  network.wormholeChainId,
  Buffer.from(tryNativeToHexString(network.testToken, "ethereum"), "hex")
);
console.log("Wrapped token created at: ", wrappedTokenAddress);
```

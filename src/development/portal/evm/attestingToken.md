# EVM: Attesting a Token

Attesting a token from EVM only needs to happen once per token, and is typically done via the Portal UI. 

If you need to do it programmatically, you can also use the JS SDK to attest a token:

The first step is to create an AttestMeta VAA. We do this by calling `attestFromEth()` function from the JS SDK and passing in the Token Bridge address, an Ethers signer object, and the address of the Token we want to attest:

```js

const networkTokenAttestation = await attestFromEth(
    network.tokenBridgeAddress, // Token Bridge Address
    signer, //Private Key to sign and pay for TX + RPC Endpoint
    network.testToken //Token Address
);

```

Anyone can attest any token on the network.

To complete the attestation, grab the VAA that the `attestFromEth()` function generates by getting the Emitter address of the Token Bridge and the Sequence from the logs of the transaction receipt. 

Then, fetch against a Guardian REST endpoint. It could take a moment (up to 30 seconds) for the Guardian to see and sign the VAA, so it's a good idea to poll the Guardian every few seconds until the VAA is found. 

```js

const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
const seq = parseSequenceFromLogEth(networkTokenAttestation, network.bridgeAddress);
const vaaURL =  `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
console.log("Searching for: ", vaaURL);
let vaaBytes = await (await fetch(vaaURL)).json();
while(!vaaBytes.vaaBytes){
    console.log("VAA not found, retrying in 5s!");
    await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
    vaaBytes = await (await fetch(vaaURL)).json();
}

```

Next, we submit the VAA onto the target chain to create a wrapped version of the Token by calling `createWrapped()`. On an EVM chain, this will deploy a Portal Wrapped Token contract whose mint authority is the Portal Token Bridge on that chain. Sometimes, this transaction throws an unpredicatable gas price error, so set a high gas limit.

After the wrapped token is created, you can get the new wrapped token address by calling the `wrappedAsset()` function of the TokenBridge.

```js

await targetTokenBridge.createWrapped(Buffer.from(vaaBytes.vaaBytes, "base64"), {
    gasLimit: 2000000
});
await new Promise((r) => setTimeout(r, 5000)); //Time out to let block propagate
const wrappedTokenAddress = await targetTokenBridge.wrappedAsset(
    network.wormholeChainId,
    Buffer.from(
        tryNativeToHexString(network.testToken, "ethereum"),
        "hex"
    )
);
console.log("Wrapped token created at: ", wrappedTokenAddress);
```


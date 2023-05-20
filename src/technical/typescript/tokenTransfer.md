# Token Transfers

<!-- //TODO this information should be captured elsewhere One challenge that arises for new EVM developers is that, because EVM uses unsigned integers, there's no concept of decimals. Therefore, tokens usually have up to 18 zeros behind them to denote up to 18 decimal places. Wormhole normalizes this to *eight* zeros, with transfer amounts rounded down to the nearest 8th decimal.  -->

Before transferring tokens, you should ensure that the token is [registered](./attestingToken.md) on the chain you are transferring to, and that any necessary prerequisite steps (such as sending token approvals or creating associated token accounts) have already been done.

There are four steps to transferring a token:

1. If not already done, complete a standard ERC-20 token approval prior to performing a bridge action if you're in the EVM ecosystem.

```js
// Here we are approving and transferring 50 tokens. The ERC20 token we are transferring has 18 decimal places.
const bridgeAmt = ethers.utils.parseUnits("50", "18");

await treasury.approveTokenBridge(bridgeAmt, {
  gasLimit: 2000000,
});
```

2. Initiate a transfer by calling `transfer` on the token bridge module which will create a transfer VAA. 

_Note that the target recipient is a Wormhole-format address (referred to as 'hex' format in the Typescript SDK)._

```js
const targetRecepient = Buffer.from(
  tryNativeToHexString(targetDeployment.deployedAddress, "ethereum"),
  "hex"
);

const tx = await (
  await treasury.bridgeToken(
    bridgeAmt,
    targetNetwork.wormholeChainId,
    targetRecepient
  )
).wait();
```

3. Retrieve the VAA with the `emitterAddress` of the Token Bridge and the `sequence` from the logs of the transaction receipt. (This is the same code as shown in the previous section.)

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

4. Submit the VAA to the target chain by calling `completeTransfer()`.

If you're not using a relayer, you'll have to submit the target chain transaction yourself. [This section](./polygon-oasis-relayer.md) outlines how to use relayers.

```js
const completeTransferTx = await targetTokenBridge.completeTransfer(
  Buffer.from(vaaBytes.vaaBytes, "base64")
);
```

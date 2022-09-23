# Token Transfers

<!-- //TODO this information should be captured elsewhere One challenge that arises for new EVM developers is that, because EVM uses unsigned integers, there's no concept of decimals. Therefore, tokens usually have up to 18 zeros behind them to denote up to 18 decimal places. Wormhole normalizes this to *eight* zeros, with transfer amounts rounded down to the nearest 8th decimal.  -->

Before transferring tokens, you should ensure that the token is [Registered](./attestingToken.md) on the chain you are transferring to, and that any necessary prerequisite steps (such as sending token approvals or creating associated token accounts) have already been done.

For example, you'll likely need to do a standard ERC-20 token approval prior to performing a bridge action if you're in the EVM ecosystem.

```js
// Here we are approving and transfering 50 tokens. The ERC20 token we are transfering has 18 decimal places.
const bridgeAmt = ethers.utils.parseUnits("50", "18");

await treasury.approveTokenBridge(bridgeAmt, {
  gasLimit: 2000000,
});
```

Once any prerequisite steps have been handled, simply call `transfer` on the token bridge module to initiate a transfer and create a transfer VAA. Note that the target receipient is a Wormhole-format address (referred to as 'hex' format in the Typescript SDK).

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

If you're not using a relayer, you'll have to submit the target chain transaction yourself. [This section](./polygon-oasis-relayer.md) outlines how to use relayers.

This code shows how to retrieve the VAA. (It's the same code as shown in the previous section.)

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

After we've fetched the VAA, we can call the `completeTransfer()` function on the target chain.

```js
const completeTransferTx = await targetTokenBridge.completeTransfer(
  Buffer.from(vaaBytes.vaaBytes, "base64")
);
```

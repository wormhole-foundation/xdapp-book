# NFT Layer

This section will explain how to properly interact with the NFT Layer in an EVM ecosystem.

## Configuring the interface

[Here]() is the interface for applications to interact with Wormhole's NFT layer.
//TODO link to file in github so doesn't become stale

Instantiating the interface will depend on your development ecosystem and blockchain. The Wormhole xAsset contract address is usually stored in your contract address.

Below is an example line of code to instantiate the interface for mainnet Ethereum:

```
address private wormhole_NFT_bridge_address = address(0x6FFd7EdE62328b3Af38FCD61461Bbfc52F5651fE);
INFTBridge NFT_bridge = INFTBridge(wormhole_nft_bridge_address);
```

## Transferring a NFT

The Wormhole NFT Bridge only supports tokens that support the ERC-721 interface and will create a wrapped NFT with identical metadata. How this is implemented varies by ecosystem.

**Note**: Unlike xAssets, there is no attestation required for bridging NFTs.

To transfer a NFT, there are three steps:

1. Initiate the NFT transfer
    - This function call will return a `sequence` (uint64) that is used in the VAA retrieval step

```
transferNFT(tokenAddress, tokenID, recipientChain, recipient, nonce);
```

2. Retrieve the emitted VAA.
    - _Note: NFT Transfer VAAs are retrieved from the Guardian Network by the `emitterChainID`, `emitterAddress`, and `sequence`_
```
const emitterAddr = getEmitterAddressEth(network.NFTBridgeAddress);
const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
const vaaURL = `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
let vaaBytes = await (await fetch(vaaURL)).json();
while (!vaaBytes.vaaBytes) {
  console.log("VAA not found, retrying in 5s!");
  await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
  vaaBytes = await (await fetch(vaaURL)).json();
}
```

3.  Complete the NFT transfer

```
completeTransfer(VAA);
```

## Additional utility

//TODO NFT verification and perhaps some other common usecases

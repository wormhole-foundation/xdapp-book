# NFT Bridge

This section will explain how to properly interact with the NFT Bridge Module in an EVM ecosystem.

## Configuring the interface

[Here](https://github.com/wormhole-foundation/wormhole/tree/dev.v2/ethereum/contracts/interfaces) is the interface for applications to interact with Wormhole's NFT Bridge.

<!---
TODO
merge down the interface PR and link to actual file
-->

Instantiating the interface will depend on the contract address of your development ecosystem and blockchain.

Below is an example line of code to instantiate the interface for mainnet Ethereum:

```
address private wormhole_NFT_bridge_address = address(0x6FFd7EdE62328b3Af38FCD61461Bbfc52F5651fE);
INFTBridge NFT_bridge = INFTBridge(wormhole_nft_bridge_address);
```

## Transferring a NFT

The Wormhole NFT Bridge only supports tokens compliant with the ERC-721 interface, and functions by creating a 'wrapped NFT' with identical metadata. How this is implemented varies by ecosystem.

**Note**: Unlike tokens, there is no attestation required for bridging NFTs.

To transfer a NFT, there are three steps:

1. Initiate the NFT transfer
   - This function call will return a `sequence` (uint64) that is used in the VAA retrieval step

```
transferNFT(tokenAddress, tokenID, recipientChain, recipient, nonce);
```

2. Retrieve the emitted VAA from the Guardian Network. (Usually done by a relayer)
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

3.  Complete the NFT transfer by submitting the resultant VAA to the target chain.

```
completeTransfer(VAA);
```

<!---
TODO

additional usecases, most specifically how to grab the origin address of the wrapped NFT
-->

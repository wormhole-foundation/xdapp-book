# xData and xAssets

High on the wishlist of blockchain features is the ability to detach tokens from their native chains. It is a tremendous limitation that ETH only exists on Ethereum, MATIC only exists on Polygon and SOL only exists on Solana. It would be far more useful if those assets were able to move freely, independent of their native blockchains.

That thought underpins the idea of an **xAsset**, which could be considered a next-generation _wrapped token_. In a sense, xAssets exist on a layer _outside_ of the blockchain ecosystem, and so are able to transact on a variety of blockchains. An xAsset is chain- and path-agnostic, so it retains fungibility regardless of where it travels. xAssets can also move fluidly around the blockchain ecosystem without ever becoming double-wrapped. 

Now that we've established the idea of an xAsset, you might think they're an excellent atomic unit for solving interoperability challenges. However, xAssets are just one step short of the real solution. Let's take a step back: blockchains now process arbitrary data, and some of that data just happens to represent assets. The full solution then, is to create **xData**.

xData is akin to an xAsset in that it exists in its own layer independent of any blockchain, which makes xData accessible by _all_ blockchains. The  difference is that xData represents arbitrary data rather the token information represented by an xAsset.

Cross-chain interoperability then becomes a matter of creating, consuming and managing xData. Once blockchains have the ability to read and write data into a shared, global reservior, application design can take on innovative new dimensions.

## Branded Terms

In some instances, Wormhole uses general terms for decentralized, cross-chain elements as branded verbiage. In most cases, the definition of the general term does not greatly differ from Wormhole definition, though Wormhole's definitions may be more narrow than general interpretations. 

**xData** - Wormhole defines xData as "data that exists in a layer outside of Layer 1 blockchains, which is accessible by all chains." The Wormhole definition of xData presents it as a branded element of xChain.

**xAssets** - Wormhole defines xAssets as a "chain-and-path agnostic token that exists on a layer outside the blockchain ecosystem, which can be used to conduct transactions on any blockchain." The Wormhole definition of xAssets presents itself as an element of xChain. 

Later in this document, we'll delve deeper into how Wormhole implements this xData layer (also referred to as the 'Core' layer of Wormhole), but for now let's talk about how xData can be used to create xDapps.

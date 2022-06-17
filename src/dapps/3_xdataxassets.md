# xData and xAssets

One of the biggest items on the wishlist of features for blockchains is the ability to detach tokens from their native chains. It is a tremendous limitation that ETH only exists on Ethereum, MATIC only exists on Polygon, and SOL only exists on Solana. It would be much more convenient if those assets existed independently of their blockchains, and were able to move freely.

This is the concept of an **xAsset**, and it should be thought of as the next-generation _wrapped token_. The key feature of an xAsset is that it is chain and path agnostic, and thus retains fungibility regardless of where it travels. xAssets can move fluidly around the blockchain ecosystem without ever becoming double-wrapped. In a sense, xAssets are abstracted to a layer _outside_ of the blockchain ecosystem, and are then able to transact on whatever blockchain is most sensible.

Once you've envisioned this next-generation asset, you might think it's an excellent atomic unit for solving interoperability. However, this idea is just one step short of the real solution. Blockchains process arbitrary data nowadays, and some of that data just happens to represent assets. The full solution then - is to invent **xData**.

**xData** is akin to an xAsset, in that it exists in its own layer independent of any blockchain, which is then accessible by _all_ blockchains. The only difference is that it represents arbitrary data, rather than token information.

Cross-chain interoperability then reduces to the problem of creating and consuming xData. Once blockchains are able to read and write into this xData layer, xAssets are simply a use-case, and come as almost a natural consequence. If you have the ability to read and write data into a shared, global reservior, you can design any application you can imagine.

In chapter 2 we'll delve deeper into how Wormhole implements this xData layer (also referred to as the 'Core' layer of Wormhole), but for now let's move on to how xDapps can be created on top of it.

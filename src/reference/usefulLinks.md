# Tools and Useful Links

Below are a variety of tools and information in the Wormhole ecosystem that can help you develop xDapps.

### [Design Documents](https://github.com/certusone/wormhole/tree/dev.v2/whitepapers)

Wormhole's component design specifications outline the reasoning behind design decisions with added technical depth.

### Testnet

Wormhole has deployed Core Bridge, Token Bridge and NFT Bridge contracts on various testnets of the chains connected by Wormhole. You can see the deployed addresses [here](./contracts.md). 

_Note: There's only a single Guardian that oversees the testnets, so you might experience a higher rate of missed VAAs than you would on mainnet._

### [Testnet Bridge UI](https://wormhole-foundation.github.io/example-token-bridge-ui/#/transfer)

An example UI provided to test out attesting and bridging tokens on testnet.

### Tilt

Tilt is a Kubernetes-based tool that runs a copy of every chain along side a Guardian node to create a simulated testing environment. Details on how to set it up and test against it is [here](../development/tilt/overview.md).

### Wormhole Core Repository

The Wormhole core repository can be found at [https://github.com/wormhole-foundation/wormhole](https://github.com/wormhole-foundation/wormhole).

### [Wormhole Explorer](https://wormholenetwork.com/explorer)

Tool to observe all Wormhole activity and can help you parse VAAs after they've been picked up the Guardian network.

### Wormhole SDK

The SDK is a set of Javascript tools to help you do Token Bridge transfers, plus fetch and submit VAAs from one chain to another. You can install it via [NPM](https://www.npmjs.com/package/@certusone/wormhole-sdk).

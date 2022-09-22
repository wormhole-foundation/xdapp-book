# Useful Links

Below are a variety of useful links to tools and information in the Wormhole ecosystem that can help you develop xDapps.

### Design Documents

Wormhole's component design specifications can be found [here](https://github.com/certusone/wormhole/tree/dev.v2/whitepapers). These outline the reasoning behind design decisions with added technical depth.

### Testnet

Wormhole has deployed Core Bridge, Token Bridge and NFT Bridge contracts on various testnets of the chains connected by Wormhole. You can see the deployed addresses [here](./contracts.md). There's only a single Guardian that oversees the testnets, so you might get a higher rate of missed VAAs than you would on mainnet.

### Testnet Bridge UI

If you'd like to try out bridging tokens on testnet, there's a UI you can use to attest and transfer tokens for testnet, hosted [here](https://wormhole-foundation.github.io/example-token-bridge-ui/#/transfer).

### Tilt

Tilt is a Kubernetes-based tool that runs a copy of every chain along side a Guardian node to create a simulated testing environment. To set it up and test against it, start [here](../development/tilt/overview.md).

### Wormhole Core Repository

The Wormhole core repository can be found at [https://github.com/wormhole-foundation/wormhole](https://github.com/wormhole-foundation/wormhole).

### Wormhole Explorer

[Wormhole Explorer](https://wormholenetwork.com/en/explorer) is a tool that will help you parse VAAs after they've been picked up the Guardian network.

### Wormhole SDK

The SDK is a set of Javascript tools to help you do Token Bridge transfers, plus fetch and submit VAAs from one chain to another. You can install it via [NPM](https://www.npmjs.com/package/@certusone/wormhole-sdk).
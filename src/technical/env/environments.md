# Choosing an Environment

Sending a cross-chain message through Wormhole involves initiating a message on chain A, the Wormhole contract on chain A, the Guardian network, receiving a message on chain B, and the Wormhole contract on chain B.

### Devnet

Wormhole provides two different local development environments to simulate these different elements. Below are those two options and the high level pros and cons of each.

1. [Wormhole Local Validator](./wlv.md)

   - Pros

     - Lightweight, low system resource demand
     - Good iteration times
     - Can be added into an existing blockchain development setup

   - Cons
     - You may end up reinventing the tilt/testnet environment as you add more components

2. [Tilt](./tilt.md)

   - Pros

     - Out of the box support for the many components needed to develop across the heterogenous blockchain space
     - Consistent development environment, where contracts deploy deterministically & everything is already linked up
     - Ability to easily turn containers on and off as needed

   - Cons
     - Relatively high system requirements. Specifically is RAM intensive
     - Iteration requires docker container rebuilds, which can be slow
     - Most blockchains are 'fresh', and thus may require you to deploy your own contract dependencies.

### Testnet

To test your application on the various testnets, there are Wormhole contracts and one Guardian node deployed. You can find the contracts [here](../../reference/contracts.md) and the rpc node [here](../../reference/rpcnodes.md).

There are two main obstacles with testing in testnet:

- Many testnet blockchains are somewhat unstable and unreliable
- Getting testnet tokens is a nuisance

**Note:** There is only one Guardian node deployed for testnet, there is a small chance that your VAA will not be processed. This rate is _not_ indicative of performance on mainnet where there are 19 Guardian nodes watching for transactions.

### Mainnet

To deploy to mainnet, you can find the contracts [here](../../reference/contracts.md) and the rpc node [here](../../reference/rpcnodes.md).

---

Express what a normal development stack looks like in Wormhole

- Minimum components
- additional components
- contract dependency hell

## Basics

Cross-chain development environments are inherently more complex than

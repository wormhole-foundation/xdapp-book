# Tilt

### What is Tilt?

[Tilt](https://tilt.dev/) is part of the Docker ecosystem. It allows developers to easily configure a Kubernetes environment for development.

In the context of Wormhole, the 'Tilt' environment is the development environment used by the [Wormhole Core Repository](https://github.com/wormhole-foundation/wormhole). It utilizes Tilt to set up a development environment with all the tools necessary to build across multiple blockchains. It has docker images for all the common items encountered during cross-chain developing, including:

- All the supported blockchains / ecosystems of Wormhole
- A Guardian Node
- Relayers
- Databases, Redis
- Utility frontends

The Tilt environment is meant to be an entire cross-chain ecosystem right out of the box.

### Is Tilt Right for You?

Tilt is a generally a good starting point for most developers. Here's a succinct list of the pros and cons of the environment, so you can decide if it's the right fit for you.

### Pros

- Out-of-the-box support for the many components needed to develop across the heterogenous blockchain space.
- Consistent development environment, where contracts deploy deterministically & everything is already linked up.
- Ability to easily enable/disable contracts as needed.

### Cons

- Relatively high system requirements. This can be mitigated by disabling components.
- Most blockchains are 'fresh' and have no contracts by default. Thus, you may have to deploy your own dependencies, or alter the default tilt configuration.
- Spin-up and rebuild times can be slow. This can result in a slow workflow if you rely on docker rebuilds.

# Setting up Tilt

The Tilt environment functions best in a UNIX-style environment. For Windows users, using a WSL environment is recommended.

In order to run the Tilt environment, you'll first need to make sure you have [Tilt](https://docs.tilt.dev/install.html) and [Go](https://go.dev/doc/install) installed.

Once you've installed these two dependencies, just clone the Wormhole Core Repository and start Tilt.

```
git clone --branch dev.v2 https://github.com/wormhole-foundation/wormhole.git

cd wormhole

tilt up
```

Be sure to check out the **Tiltfile**, which has much of the configuration and arguments for the development environment. It's relatively straightforward to enable and disable components. For example, you can disable blockchains by setting them to false at startup

```
tilt up -- --algorand=false --near=false --solana=false terra_classic=false terra2=false
```

# Using Tilt

Tilt can pretty much be treated as though it's an external environment that you can easily spin up and tear down.

If you've followed the standard setup, all your resources will be bound to various ports on localhost. To see all the endpoints which are being hosted in your Tilt environment, you should check the Tilt dashboard, located at http://localhost:10350/overview.

Tilt is actually referred to as 'Devnet' in the Wormhole ecosystem, so anywhere you see information labeled as 'Devnet', you can apply it to Tilt.

For example, you can find all the deployed contract addresses in the 'Devnet' [constants](https://github.com/wormhole-foundation/wormhole/blob/dev.v2/sdk/js/src/utils/consts.ts) of the Wormhole Typescript SDK.

Useful information pertaining to funded wallets & useful private keys can also be found in the [devnet.md](https://github.com/wormhole-foundation/wormhole/blob/dev.v2/docs/devnet.md) file of the docs.

From here, Tilt is quite similar to using Testnet, and you should look at the [Tooling](./tooling.md) page for additional resources.

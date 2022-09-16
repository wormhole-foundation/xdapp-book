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

## Is Tilt Right for You?

Tilt is a generally a good starting point for most developers. Here's a succinct list of the pros and cons of the environment, so you can decide if it's the right fit for you.

Pros

- Out-of-the-box support for the many components needed to develop across the heterogenous blockchain space.
- Consistent development environment, where contracts deploy deterministically & everything is already linked up.
- Ability to easily enable/disable contracts as needed.

Cons

- Relatively high system requirements. This can be mitigated by disabling components.
- Most blockchains are 'fresh' and have no contracts by default. Thus, you may have to deploy your own dependencies, or alter the default tilt configuration.
- Spin-up and rebuild times can be slow. This can result in a slow workflow if you rely on docker rebuilds.

## Setting up Tilt

show basic setup for each ecosystem, list installed dependencies
explain the tiltfile, show how to enable/disable components, give command for starting with just two evm chains

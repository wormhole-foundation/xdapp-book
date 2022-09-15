# Tilt

- tilt is a unique environment specifically set up to deal with the challenges of cross-chain development
- used by the Wormhole core repository
- Uses tilt to configure and manage a kubernetes environment.
- has docker containers for every ecosystem supported by wormhole, along with containers for things like the guardian, spy, generic relayers, etc
- Big bad development ecosystem with all the tools, used by core contributors

Pros

- Out of the box support for the many components needed to develop across the heterogenous blockchain space
- Consistent development environment, where contracts deploy deterministically & everything is already linked up
- Ability to easily turn containers on and off as needed

Cons

- Relatively high system requirements. Specifically is RAM intensive
- Iteration requires docker container rebuilds, which can be slow
- Most blockchains are 'fresh', and thus may require you to deploy your own contract dependencies.

show basic setup for each ecosystem, list installed dependencies
explain the tiltfile, show how to enable/disable components, give command for starting with just two evm chains

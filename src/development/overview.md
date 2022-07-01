# Wormhole Development Overview

To get started with cross chain development, first you're going to need a local environment to test your xdapp code on. The general flow for a cross chain message goes from an application deployed to chain A, to the Wormhole contract on chain A, to the Guardian network, then submitted to chain B. 

To simulate all of these things locally, we need to be able to deploy some chains, deploy the Wormhole contracts to these chains, and then run atleast one Wormhole validator to pick up messages. Later, we might even introduce a relayer to automatically submit messages, but that's currently only supported for Mainnet Token Bridge transfers for native and stable coins. Developers currently have to use either a manual relayer method or an app sepecific relayer (but more on that in the Relayer section).

First, before we setup an xdapp project, we'll need to choose a local environment to run the Wormhole Guardian Network. We can use either Wormhole Local Validator or Tilt.

- [Wormhole Local Validator](./wormhole-local-validator.md): This is the simplest, custom environment. It's BYOB (Bring your own Blockchain), where you can run your own local validator nodes and connect them to a single guardian running on docker. Initial setup can take upwards of 500 seconds, but after the image is built, bringing it up and down is usually <1 minute. It requires installing the software for the validator nodes locally on your computer or somewhere to run them.
- [Tilt](./tilt/overview.md): A full fledged Kubernetes deployment of *every* chain connected to Wormhole, along with a Guardian node. Usually takes 30 min to spin up fully, but comes with all chains running out of the box. 

### Testnet
If you want to test on the various test and devnets of existing connected chains, there's a single guardian node watching for transactions on various test networks. You can find the contracts [here](../reference/contracts.md) and the rpc node [here](../reference/rpcnodes.md).

One thing to watch out for is that because testnet only has a single guardian running, there's a small chance that your VAAs do not get processed. This rate is *not* indiciative of performance on mainnet, where there are 19 guardians watching for transactions. 

### Mainnet
When you're ready to deploy to mainnet, you can find the mainnet contracts [here](../reference/contracts.md) and the mainnet rpc nodes [here](../reference/rpcnodes.md).

## Next Steps
To get started, first clone the a local host environment (WLV or Tilt), then proceed to the first project, the [evm-messenger](../projects/evm-messenger/overview.md).
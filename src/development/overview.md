# Wormhole Development Overview

Cross-chain messages typically flow from an application deployed to a blockchain to the Wormhole contract on that same chain, then to the Guardian network before finally being submitted to a host chain. 

To test your xDapp code, you'll need a local environment to simulate this process. Your local environment needs to be able to deploy multiple chains, deploy  Wormhole contracts to those chains and run at least one Wormhole validator to pick up messages.  

Later, we can introduce a relayer to automatically submit messages, though this is currently supported for Mainnet Token Bridge native and stable coin transfers only. Currently, developers need to use either a manual relayer method or an app-sepecific relayer. You can find more details on relayers in the Relayers section of this guide.

Before we set up an xDapp project, we'll need to choose a local environment to run the Wormhole Guardian Network. Our best options are either Wormhole Local Validator or Tilt.

- [Wormhole Local Validator](./wormhole-local-validator.md): This is the simplest custom environment. It's BYOB (Bring your own Blockchain) with the ability to run your own local validator nodes and connect them to a single Guardian running on docker. Initial setup can take upwards of 500 seconds, but after the image is built, bringing it up and down should take less than a minute. This environment requires installing the software for the validator nodes locally.

- [Tilt](./tilt/overview.md): A full-fledged Kubernetes deployment of every chain connected to Wormhole, along with a Guardian node. Usually takes 30 min to spin up fully, but comes with all chains running out of the box. 

### First Steps
To get started, first clone the a local host environment (WLV or Tilt), then proceed to the first project, the [evm-messenger](../projects/evm-messenger/overview.md).

### Testnet
If you want to test on the various test and devnets of existing connected chains, there's a single Guardian node watching for transactions on various test networks. You can find the contracts at [../reference/contracts.md](../reference/contracts.md) and the rpc node at [../reference/rpcnodes.md](../reference/rpcnodes.md).

Because testnet only has a single Guardian, there's a small chance that your VAAs will not be processed. This rate is not indiciative of performance on mainnet, where there are 19 Guardians watching for transactions. 

### Mainnet
When you're ready to deploy to mainnet, you can find the mainnet contracts at [../reference/contracts.md](../reference/contracts.md) and the mainnet rpc nodes at [../reference/rpcnodes.md](../reference/rpcnodes.md).

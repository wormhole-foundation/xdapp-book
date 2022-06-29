# Wormhole Development Overview
Getting started with Wormhole development ususally starts with testing your contract code locally -> deploying to testnet -> deploying to mainnet. 

In each of these environments, we need to have atleast 2 different blockchains, as well as atleast one Guardian node running to observe and sign VAAs. 

## Environments

### Localhost
- Guardiand: This is the simplest, custom environment. It's BYOB (Bring your own Blockchain), where you can run your own local validator nodes and connect them to a single guardian running on docker. Initial setup can take upwards of 500 seconds, but after the image is built, bringing it up and down is usually <1 minute. 
- Tilt: A full fledged Kubernetes deployment of *every* chain connected to Wormhole, along with a Guardian node. Usually takes 30 min to spin up fully, but comes with all chains running out of the box. 

### Testnet
If you want to test on the various test and devnets of existing connected chains, there's a single guardian node watching for transactions on various test networks. You can find the contracts [here](../reference/contracts.md) and the rpc node [here](../reference/rpcnodes.md).

One thing to watch out for is that because testnet only has a single guardian running, there's a small chance that your VAAs do not get processed. This rate is *not* indiciative of performance on mainnet, where there are 19 guardians watching for transactions. 

### Mainnet
When you're ready to deploy to mainnet, you can find the mainnet contracts [here](../reference/contracts.md) and the mainnet rpc nodes [here](../reference/rpcnodes.md).
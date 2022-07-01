# EVM Messenger

The EVM messenger project is a very simple contract that sends messages from one contract on an EVM chain to it's sibling contract on Chain B. Before you get started with this project, make sure you have a local Wormhole Guardian Network running (either [WLV](../../development/wormhole-local-validator.md) or [Tilt](../../development/tilt/overview.md)). If you're running WLV, you'll also need to spin up EVM0 and EVM1 so we have two EVM chains to send messages back and forth.

Let's break down the files you're going to find in [evm-messenger](https://github.com/certusone/xdapp-book/tree/main/projects/evm-messenger) folder.

### Chains
Firstly, the `chains/` folder contains the source code that's actually being deployed to the EVM chain. The `evm/` folder found inside was generated using [`forge init`](https://getfoundry.sh). There's two files to of note in this folder, `src/Wormhole/IWormhole.sol` and `src/Messenger.sol`. 

The IWormhole file is the Wormhole Core Bridge interface and required if your app wants to be able to talk to the Wormhole Core Bridge. It outlines the functions and return values you can expect from the Wormhole contract.

The second file, Messenger, we will cover in our breakdown of the EVM code [here](./messenger.md).

### Tests
We have a very very simple test script written in bash. It's less of a test script and more of a happy path walkthrough. It makes uses of Orchestrator.js (see below) to call the functions on our EVM contract in order. 

We first deploy the code, register the applications on each chain, and then send a message. 

### Orchestrator
Orchestrator is a very simple js client that takes arguements from the command line to call the various functions on our contract. We'll break down everything orchestator does [here](./client.md).

### xdapp.config.json
This maintains some constants about the chains RPC endpoints, private keys used to deploy code, etc. Also includes the Wormhole RPC endpoint.
# EVM Messenger

The EVM messenger project is a simple contract that sends messages from one contract on an EVM chain to its sibling contract on another chain.

Before you get started with this project, make sure you have a local Wormhole Guardian Network running (either [WLV](../../development/wormhole-local-validator.md) or [Tilt](../../development/tilt/overview.md)). If you're running WLV, you'll also need to spin up EVM0 and EVM1 so there are two EVM chains to send messages back and forth.

Let's break down the files you're going to find in the [evm-messenger](https://github.com/wormhole-foundation/xdapp-book/tree/main/projects/evm-messenger) folder.

### Chains

The `chains/` folder contains the source code that's actually being deployed to the EVM chain. The `evm/` folder found inside was generated using [`forge init`](https://getfoundry.sh). There are two files of note in this folder, `src/Wormhole/IWormhole.sol` and `src/Messenger.sol`.

The IWormhole file is the Wormhole Core Bridge interface, and is required if your app wants to talk to the Wormhole Core Bridge. It outlines the functions and return values you can expect from the Wormhole contract.

The second file, Messenger, is covered in our breakdown of the EVM code [here](./messenger.md).

### Tests

We have a very simple test script written in bash, but it's less of a test script and more of a happy path walkthrough. It makes uses of Orchestrator.js (see below) to call the functions on our EVM contract in order.

To start, deploy the code, register the applications on each chain and then send a message.

### Orchestrator

Orchestrator is a js client that takes arguments from the command line to call various functions on our contract. We'll break down everything orchestator does [here](./client.md).

### xdapp.config.json

This maintains some constants about the chains RPC endpoints, private keys used to deploy code, etc. It also includes the Wormhole RPC endpoint.

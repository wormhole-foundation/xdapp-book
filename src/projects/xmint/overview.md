# xMint

The xMint project is a sample project that completes one of the more common cross-chain user interactions: user stays on their native chain and swap a native token for another chain's native token.

Behind the scenes of what the users sends and receives is a string of Wormhole interactions described in high level below

1. User sends native token to xDapp.
2. xDapp initiates a Contract Controlled Transfer to corresponding contract on destination chain that contains both the user's tokens and a data payload.
3. Corresponding contract on destination chain verifies and parses VAA to perform the user's intended swap.
4. Corresponding contract on destination chain initiates a token transfer to user's wallet.

Before you get started with this project, make sure you have a local Wormhole Guardian Network running (either [WLV](../../development/wormhole-local-validator.md) or [Tilt](../../development/tilt/overview.md)). If you're running WLV, you'll also need to spin up EVM0 and Solana so there is a EVM and Solana chain to send messages and tokens back and forth.

Let's break down the files you're going to find in the [xMint](https://github.com/wormhole-foundation/xdapp-book/tree/main/projects/xmint) folder.


### Chains

The `chains/` folder contains the source code that's actually being deployed to both the EVM and Solana chains which are organized in the `evm/` and `solana/` folders respectively.

Each of these folders are organized according to best practices associated with building projects on each chain -- i.e. for EVM, the `.src/` folder contains (1) `Wormhole` which has all the contract interfaces needed to interact with Wormhole Core and Token Bridge and (2) `xMint.sol` which is the main contract defining the application.

A more in depth breakdown of the EVM code is [here](./xMintEVM.md) and the Solana code is [here](./xMintSolana.md).

### Tests

We have a very simple test script written in bash, but it's less of a test script and more of a happy path walkthrough. It makes uses of Orchestrator.js (see below) to call the functions on our EVM and Solana contract in order.

To start, deploy the code, register the applications on each chain and then send a message.

### Orchestrator

Orchestrator is a ts client that takes arguments from the command line to call various functions on our contract. We'll break down everything orchestator does and the associated handlers [here](./client.md).

### xdapp.config.json

This maintains some constants about the chains RPC endpoints, private keys used to deploy code, deployed contract addresses, etc. It also includes the Wormhole RPC endpoint.
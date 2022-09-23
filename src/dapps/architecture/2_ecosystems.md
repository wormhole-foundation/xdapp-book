# Ecosystems

At present, there are 6 ecosystems supported by Wormhole, though the number of supported ecosystems is always growing.

### EVM

EVM is the most popular ecosystem, and most xDapps will have some support for this platform. These contracts are written in Solidity -- a 'jack of all trades' style of computation environment. A common strategy for xDapps is to develop one single contract in Solidity, and then deploy that contract to all the supported EVM blockchains.

Example chains:

    - Ethereum
    - Polygon
    - BNB Chain
    - Avalanche (C Chain)
    - Aurora (Near Network)
    - Karura (Polkadot Network)
    - Acala (Polkadot Network)
    - Celo
    - Fantom
    - Oasis (Emerald)

### Solana

Solana is characterized by its high transaction throughput, increased computation power and cheap data storage when compared to EVM environments. These contracts are written in Rust.

### Cosmos

Cosmos is a network of blockchains that share a common ecosystem. Cosmos is a general purpose environment, but excels in certain areas like application-specific blockchains and the use of Cosmos-wide standards via its sdk 'modules.' It uses CosmWasm for its smart contract runtime, which is based in Rust.

### Algorand

Algorand is a leading blockchain on the state proof front and repesents the bleeding edge of trustlessness. These contracts are written in Python.

### Aptos

Aptos is characterized by its optimisitic approach to computation parallelization to bring increased performance. These contracts are written in Move.

### NEAR

NEAR is characterized by its sharding technology that may allow for greater transaction capacity and security. These contracts are written in Rust.

### Read-Only Chains

Some chains in the Wormhole ecosystem are 'Read-Only.' These chains are able to verify messages emitted from other chains in the network, but are not able to emit messages themselves. For information about these chains, check the [contracts page](../../reference/contracts.md).

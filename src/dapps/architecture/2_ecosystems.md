# Ecosystems

At present, there are 3 ecosystems supported by Wormhole, though the number of supported ecosystems is always growing.

### EVM

EVM is the most popular ecosystem, and most xDapps will have some support for this platform. These contracts are written in Solidity, and it is generally a 'jack of all trades' style of computation environment. A common strategy for xDapps is to develop one single contract in Solidity, and then deploy that contract to all the supported EVM blockchains.

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

Solana is characterized by its high transaction throughput, increased computation power, and cheap data storage when compared to EVM environments. These contracts are written in Rust.

### Cosmos

Cosmos is a network of blockchains which share a common ecosystem. Cosmos is a general purpose environment, but excels in certain areas such as application-specific blockchains, and having Cosmos-wide standards via its sdk 'modules'. It uses CosmWasm for its smart contract runtime, which is based in Rust.

### Read-Only Chains

Some chains in the Wormhole ecosystem are 'Read-Only'. These chains are able to verify messages which are emitted from other chains in the network, but are not able to emit messages themselves. For information about these chains, check the [contracts page](../../reference/contracts.md).

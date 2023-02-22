# EVM

**Disclaimer**: This section is written as a guide for how to use Wormhole for experienced EVM developers. If you are new to using the EVM ecosystem, it's recommended for you to get started with a tutorial like [this](https://ethereum.org/en/developers/docs/intro-to-ethereum/).

Within the Wormhole ecosystem, EVM refers to any blockchain that utilizes EVM contracts of Wormhole -- this includes blockchains beyond Ethereum such as Polygon or Avalanche, as well as EVM+ environments such as Acala.

At certain points, it may be easiest to integrate simply by referencing the implementation of the Wormhole contracts. The official implementation for the Wormhole contracts can be found [here](https://github.com/wormhole-foundation/wormhole/tree/main/ethereum).

### Recommended Tooling for EVM

**Frontend Development**

- [Ethers](https://docs.ethers.io/v5/) an excellent, widely used library for using web-based wallets to interact with EVM blockchains.

**Contract Development and Testing**

- [Foundry](https://github.com/foundry-rs/foundry) is the preferred library for the Core Repository. It has tooling for development, testing, compilation, and even the ability to duplicate mainnet environments for development.
- [Truffle](https://trufflesuite.com/) and [Hardhat](https://hardhat.org/) are also viable alternatives.

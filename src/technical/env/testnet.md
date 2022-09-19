# Testnet

Wormhole testnet is spread across many of the most popular testnet blockchains.

The primary reason to use Wormhole testnet is in order to simplify the management of your dependent contracts. This will vary from blockchain to blockchain.

For example, some blockchain ecosystems have the standard that their contracts are closed-source, and there are no tools to fork mainnet. Other ecosystems, such as EVM, have tools like [foundry](https://github.com/foundry-rs/foundry), which allow you to hardfork the mainnet ecosystem into a local development node.

In short, testnet tends to be the correct choice only when you have contract dependencies, and those dependencies are difficult to get working in a local environment. In most other cases, testnet tends to be more work than it's worth.

If you elect to use testnet, the Wormhole contracts addresses can be found in the [Reference](../../reference/contracts.md) section.

Pros:

- Many other projects deploy their contracts to testnet.
- In ecosystems without extensive local tooling, this may be the preferred development environment.

Cons:

- Many testnets are somewhat unstable and have outages or partitioning events.
- Wormhole Testnet sometimes misses VAAs due to testnet instabilities.
- Testnet tokens are often difficult to acquire.

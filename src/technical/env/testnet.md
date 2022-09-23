# Testnet

Wormhole testnet is spread across many of the most popular testnet blockchains.

### Is Testnet right for you?

The primary reason to use Wormhole testnet is to simplify the management of your dependent contracts. This will vary from blockchain to blockchain.

For example, some blockchain ecosystems have the standard that their contracts are closed-source, and there are no tools to fork mainnet. Other ecosystems, such as EVM, have tools like [foundry](https://github.com/foundry-rs/foundry), which allow you to hardfork the mainnet ecosystem into a local development node.

In short, testnet tends to be the correct choice only when you have contract dependencies, and those dependencies are difficult to get working in a local environment. In most other cases, testnet tends to be more work than it's worth.

Here's a succinct list of the pros and cons of the environment, so you can decide if it's the right fit for you.

**Pros**

- Many other projects deploy their contracts to testnet.
- In ecosystems without extensive local tooling, this may be the preferred development environment.

**Cons**

- Many testnets are somewhat unstable and have outages or partitioning events.
- Wormhole Testnet sometimes misses VAAs due to testnet instabilities.
- Testnet tokens are often difficult to acquire.

## Using Testnet

If you elect to use testnet, the Wormhole contracts addresses can be found in the [Contracts](../../reference/contracts.md) page.
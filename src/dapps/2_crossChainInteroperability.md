# Blockchain Interoperability

Because blockchains are siloed by nature, individual cryptocurrencies being bound to their own chains has been a longtime limitation of blockchain technology. The first attempt at solving this problem was the creation of cryptocurrency exchanges like Coinbase and Binance. Today these are referred to as centralized exchanges (CEXs).

Centralized exchanges play an important role in cryptocurrency, but they are not a complete solution for blockchain interoperability for two primary reasons: (1) they're centralized, which is counterproductive to creating a decentralized platform, and (2) they deal only with tokens.

To solve the centralization problems with CEXs, decentralized exchanges (DEXs) were created. A DEX operates inside a smart contract runtime and can be as decentralized as the blockchain it runs on. Unfortunately, a DEX is only able to utilize the tokens on its native blockchain. In order to obtain a token which is not native to that chain, the DEX must be used in combination with a **bridge**.

**Bridges** are complex and will be discussed at length in a later section. For now, we can categorize bridges as applications which 'lock' assets on one chain in exchange for **wrapped assets** on another chain. The wrapped assets can then be exchanged for the original 'backing' asset.

There are some other essential things you should know about bridges before going further:

- Bridges are capable of being decentralized in theory, but are often quite centralized in practice.
- Bridges are currently the only way to hold a token on a chain other than its 'native' chain. If you're holding ETH on a chain other than Ethereum, it is, by definition, a wrapped token.
- Bridges are all mutually incompatible with each other. Using multiple bridges just makes 'double wrapped' tokens.
- If tokens have become double wrapped after traversing multiple bridges or blockchains, there can be a complex unwrapping process to get back to the original token.

This explains how the ecosystem arrived at its current state -- CEXs are a solution to siloed blockchains, DEXs are a simple response to CEXs, and DEXs have created a demand for bridges. Each solution in this timeline is an ad-hoc patch to the previous problem, and the current landscape of fractured liquidity, double wrapped tokens, isolated userbases and wallet incompatibilities is the result.

Adding to this complexity are blockchains moving toward being general-purpose computing platforms. As such, interoperability will require data structures that are more complex than tokens and operations that are more sophisticated than transfers.

More ad-hoc solutions would only be short-term fixes for long-term problems, so it's critical to design new primitive and core infrastructure that will allow the next generation of decentralized applications to move beyond these lingering limitations.

This is why Wormhole exists. Wormhole proposes a new way of developing applications which leverages the strengths of each blockchain while mitigating the problems of the current ecosystem.

---

Rethinking the next generation of decentralized applications means dethroning the token as the fundamental atomic unit of blockchains. We'll expand on this change in the next section.

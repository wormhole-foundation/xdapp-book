# Cross-Chain Interoperability

The fact that each cryptocurrency is locked to its own chain has been a limitation of blockchains since day one. It's not 'real' Bitcoin unless it's on the Bitcoin ledger, and it's not 'your' Bitcoin unless you have the private keys to the wallet.

This restriction is fine if you're content with just sending Bitcoin around, but it becomes a major obstacle as soon you want to exchange Bitcoin for any other currency.

The first attempt at solving this problem was by creating cryptocurrency exchanges, such as Coinbase and Binance. Today these are refered to as centralized exchanges, or CEXs.

Centralized Exchanges play an important role in the cryptocurrency space, but they are certainly not a silver bullet for cross-chain interoperability. This is primarily due to two reasons.

1. They're centralized, which directly defeats the purpose of creating a decentralized platform in the first place.
2. They deal only with tokens. As blockchains move away from being a simple history of token transfers, and towards being general purpose computing platforms, interoperability will involve much more complex data structures than 'tokens', and much more sophisticated operations than 'transfers'.

To solve the centralization problems associated with CEXs, decentralized exchanges (DEXs) were created. A DEX operates inside a smart contract runtime, and therefore can be as decentralized as the blockchain it runs on. Unfortunately, a DEX is only able to utilize the tokens which exist on its native blockchain, so in order to obtain a token which is not native to that chain, the DEX must be used in combination with a **bridge**.

**Bridges** are a complex beast which will be discussed in depth later. For now, we can simply categorize bridges as applications which 'lock' assets on one chain in exchange for **wrapped assets** on another chain. The wrapped assets can, in turn, be exchanged for the original 'backing' asset.

Here are some other key things to understand about bridges:

- Bridges are currently the only way to custody a token on a chain other than its 'native' chain. If you're holding ETH on some chain other than Ethereum, it is, _by definition_, a wrapped token.
- Generally, wrapped tokens become 'double wrapped' when they traverse multiple bridges or blockchains. This requires an annoying unwrapping process to get back to the original token.
- Bridges are all mutually incompatible with eachother. Using multiple bridges just makes double wrapped tokens.
- Bridges are capable of being decentralized in theory, but are often quite centralized in practice.

This brief history explains how we arrived at where we are today. CEXs are a simple solution to siloed blockchains, DEXs are a simple response to CEXs, and once you have DEXs, bridges become necessary infrastructure. Each solution in this timeline is an ad-hoc patch to the previous problem, and the current landscape of fractured liquidity, double-wrapped tokens, isolated userbases, and wallet incompatibilities is a result of this.

The way to address these issues is not to slap another bandage on top, but rather to go back to the drawing board, and design new primatives and core infrastructure which will allow the next generation of decentralized applications to never suffer from these problems in the first place.

Wormhole is an attempt to do just this. It looks at the budding decentralized computing ecosystem and proposes a new way of developing applications which leverages the strengths of each blockchain while mitigating the problems which have thusfar plagued the ecosystem.

The first step in this endeavor is to dethrone the 'token' as the fundamental atomic unit of blockchains, and instead to think of these platforms as global computers which operate on data. We'll expand upon this in the next section.

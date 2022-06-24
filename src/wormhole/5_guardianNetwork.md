# Guardian Network

The Guardian Network is the backbone and most critical component of the Wormhole ecosystem. It is designed to serve as Wormhole's oracle component, and the rest of the Wormhole ecosystem is really founded upon the technical underpinnings of this network. Therefore, this is the single most important component to learn about if you want a deep understanding of Wormhole.

To understand not just _how_ the Guardian Network works, but also _why_ it works the way it does, let's first take a step back, and go over the key considerations which went into the design. There were essentially five critical features which Wormhole needed to have in order to become the best-in-class interoperability platform.

1. **Decentralization** - Control of the network needs to be distributed amongst many parties.
2. **Modularity** - Disparate parts of the ecosystem such as the oracle, relayer, applications, etc, should be kept as separate and modular as possible so they can be designed, modified, and upgraded independently.
3. **Chain Agnosticism** - Wormhole should be able to support not only EVM, but also chains like Solana, Algorand, Cosmos, and even platforms which have not even yet been created. It also should not have any one chain as a single point of failure.
4. **Scalablity** - Wormhole should be able to secure a large amount of value immediately, and should also be able to handle the large transaction volume which will come from high-performance blockchains like Solana.
5. **Upgradeability** - As the decentralized computing ecosystem evolves and new tech becomes prevalent, Wormhole will need to be able to change the implementation of its existing modules without breaking integrators.

Next, let's go into how Wormhole achieves these one at a time.

## Decentralization

Decentralization is the biggest item. Previous interoperability solutions have largely been entirely centralized, and even newer solutions which utilize things like adversarial relayers still tend to have single points of failure or collusion thresholds as low as 1 or 2.

In designing a decentralized oracle network, the first option to consider is probably a Proof-of-Stake system. However, upon closer inspection, this actually turns out to be a suboptimal solution. PoS is designed for blockchain consensus in smart-contract enabled environments, and it's less suitable when the network is verifying the output of many blockchains and not supporting its own smart contracts. While it looks appealing from a decentralization perspective, the network security is somewhat unclear, and it also makes some of the other outlined goals more difficult to achieve, so let's discuss other options.

The first option would be to rush straight for the finish line, and use zero-knowledge proofs in order to secure the network. This would be the best from a decentralization perspective, as it's literally trustless. However, zero knowledge proofs are still a nascent technology, and it's not really feasible to verify them on-chain, especially on chains with limited computational environments. Thus, some form of multisig will be needed to secure the network.

If we take a step away from game-theoretic considerations of various consensus models and look at the current De-Fi landscape, it's easy to see that most of the top blockchains are secured by the same handful of validator companies. The reality is that at this point in time there are only a limited number of companies in the world with the skills and capital to run top-notch validator companies.

Thus, if a protocol could unite a large number of those validator companies into a purpose-built consensus mechanism which is optimized for chain interoperability, that design would likely be both more performant and more secure than a network which was bootstrapped by a tokenomics model. Assuming the validators would be on board with this idea, how many could Wormhole realistically utilize?

If Wormhole were to use threshold signatures, the answer would basically be 'as many as are willing to participate'. However, threshold signatures have spotty support across the blockchain world, this means it would be difficult and expensive to verify the signatures, which would limit scalability and chain agnosticism. Thus, a t-schnorr multisig is probably the best option as it is cheap and well supported, despite the fact that its verification costs increases linearly with the number of signatures included.

So, with all these things considered, about 19 seems to be the maximum number and a good tradeoff. While it's less ideal than 2000, it's a lot more than most protocols have. 2000 would be infeasible to verify on-chain, and there are not even 2000 top-notch validators in the world today. If 2/3 of the signatures are needed for consensus, then 13 signatures need to be verified on-chain, which remains reasonable from a gas-cost perspective.

Furthermore, rather than securing the network with tokenomics, it is better to initially secure the network by involving robust companies which are heavily invested in the success of De-Fi as a whole. The 19 Guardians are not just anonymous nobodies running their validators out of a basement. They are many of the largest and widely-known validator companies in cryptocurrency. The current Guardians can be viewed [here](https://wormholenetwork.com/network/)

Putting this all together, we end up with 19 Guardians, each with an equal stake, joined in a purpose-built Proof of Authority consensus mechanism. As threshold signatures become better supported, the guardian set can expand, and once ZKPs are ubiquitous, the Guardian Network will become fully trustless.

Now that we have Decentralization laid out, the remaining elements fall into place.

## Modularity

Because the Guardian Network is robust and trustworthy by itself, there is no need for components like the relayer to contribute to the security model. Thus, Wormhole is able to have simple components which are very good at the one thing they do. The Guardians only need to verify on-chain activity and produce VAAs. Relayers only need to concern themselves with how to interact with blockchains and deliver messages.

The signing scheme of the VAAs can be changed without affecting downstream users. Multiple relay mechanisms can exist independently. xAssets can be implemented purely at the application layer. xDapps can utilize whatever components suit them.

## Chain Agnosticism

Wormhole supports a wider range of ecosystems than any other interoperability protocol today. That is largely because it utilizes simple tech (t-schnorr signatures), an adaptable, heterogenous relayer model, and a robust validator network.

Wormhole can expand to new ecosystems as quickly as a Core Contract can be developed for the smart contract runtime. Relayers don't need to be factored into the security model, they just need to be able to upload messages to the blockchain. The Guardians are able to observe every transaction on every chain, without taking shortcuts.

## Scalability

Wormhole scales quite well, as shown by Portal's ability to handle huge TVL and transaction volume, even during tumultuous events such as the UST depeg.

The requirements for running a Guardian are relatively heavy, as they need to run a full node for every single blockchain in the ecosystem. This is another reason why a limited number of robust validator companies are beneficial for this design.

However, once all the full nodes are running, the actual computation and network overheads of the Guardian Network are quite lightweight. As such, the performance of the blockchains themselves tends to be the bottleneck in Wormhole, rather than anything which happens inside the Guardian Network.

## Upgradability

Over time, the Guardian Set can be expanded beyond 19 with the use of threshold signatures. A variety of relaying models will emerge, each with their own strengths and weaknesses. ZKPs can be used on chains where they are well supported. The xDapp ecosystem will grow, and xDapps will become increasingly intermingled with eachother. There are very few APIs in Wormhole, and most items are implementation details from the perspective of an integrator. This creates a clear pathway towards a fully trustlessness interoperability layer which spans the entirety of decentralized computing.

In the next section, we will talk about the role and responsbilities of relayers in the Wormhole ecosystem.

# Relayers

All simple cross-chain processes on Wormhole essentially boil down to a three step process:

1. Perform an action on chain A.
2. Retrieve the resulting VAA from the Guardian Network.
3. Perform an action on chain B using the VAA.

Relayers play a key role in the final step of the process -- they can be thought of as the 'write' portion of interoperability, complementing the 'read' portion that Guardians provide.

The definition of a _Relayer_ in the context of Wormhole is: Any process which delivers VAAs to a destination.

Unlike other interoperability protocols, Wormhole **does not have a required relaying methodology**.

In most designs there is a dedicated relaying mechanism which operates inside the protocol's trust boundaries. This means that the relayer either has an adversarial relationship to the oracle, or the relayer has trust assumptions and contributes to the protocol's security model. Relayers are usually a trusted party, are often also privileged, and developers are typically forced to use the relayer model built into the protocol.

In Wormhole, relayers are neither trusted nor privileged. This means relayers **cannot jeopardize security, only liveness**. Because Wormhole is designed to have a firm trust boundary at the level of the VAA, relayers have exactly the same capabilities as any regular, untrusted blockchain user.

From this perspective, relayers are just delivery trucks that deliver VAAs to their destination, and have no capacity to tamper with the delivery outcome. VAAs either get delivered or don't, which makes relayers analagous to the off-chain 'crank turners' of traditional Dapps.

As a result, Wormhole is able to facilitate a variety of heterogenous relaying mechanisms, and the developer is able to choose whatever best suit their needs.

Next, we'll go over a few of the most common relaying strategies.

## Client-side Relaying

Client-side relaying relies on the user-facing frontend, like a webpage or a wallet, to perform all three steps of the cross-chain process.

There are two major benefits of this approach:

- Low cost. Users pay exactly the transaction fee for the second transaction.
- No backend relaying infrastructure.

However, client-side relaying also has two notable drawbacks:

- Users must sign all transactions required with their own wallet.
- Users must have funds to pay the transaction fees on every chain involved.

Overall, client-side relaying is a simple solution, but can make the user experience cumbersome. It's generally not recommended if your goal is a highly-polished user experience but can be useful to getting an MVP up and running.

## Specialized Relayers

Specialized relayers solve the UX problems of client-side relayers by adding a backend component which can handle steps 2 and 3 on behalf of the user.

In this model, relayers either listen directly to the Guardian Network via a spy (called **Spy Relaying**), or will simply provide a REST endpoint to accept a VAA which should be relayed (called **REST Relaying**). Once a relayer has the VAA, it simply performs any necessary off-chain calculations and submits the VAA to the required destination.

An important consideration when developing a specialized relayer is that the relayer is still considered untrusted. VAAs are public and can be submitted by anyone, so developers should not rely on off-chain relayers to perform any computation which is considered "trusted." However, things that do not impact security like deterministic data transforms, waiting for gas prices to drop, or various forms of 'batching' can be very useful cost-reduction strategies.

Specialized Relayers have the following advantages:

    - They simplify user experience
    - They allow off-chain calculations to be performed in the relayer, reducing gas costs
    - They are generally easy to develop

However, they also have a couple notable downsides

    - They add a backend relaying component which is responsible for liveness
    - They can complicate fee-modeling, as relayers are responsible for paying target chain fees.

Due to specialized relayers being such a common solution, an extensible relayer (called the plugin relayer) has been provided in the main Wormhole repository. The plugin relayer stands up most of the requisite infrastructure for relaying, so that you only need to implement the logic which is specific to your application.

If you plan to develop a specialized relayer, consider starting from the plugin relayer [found here](https://github.com/wormhole-foundation/wormhole/tree/dev.v2/relayer).

<!--
TODO link to plugin relayer once it has been merged down
-->

Because relayers are responsible for liveness, they become another dependency component (similar to the frontend, blockchain nodes, blockchains, third party APIs, etc.) for the xDapp. If the relayers are all down, your application has an outage.

To mitigate this, multiple relayers can be run in order to provide redundancy either by (1) the xDapp team or (2) a decentralized network based off economic incentives. _However, creating a robust model for decentralized relaying is generally application-specific and complex._

Overall, Specialized Relayers add a backend component that is responsible for liveness, but can simplify the user experience. It's generally recommend if your goal is a highly-polished user experience and you want to have better control over message delivery.

# Generic Relayers

_Note: this feature is not yet available in mainnet_

Because relaying is such an integral component to xDapps, Wormhole has built a protocol which allows developers to utilize a decentralized network of untrusted relayers to deliver their messages, removing the specialized relayer as an infrastructure responsibility.

In order to utilize the generic relayer network, developers must request delivery from the Wormhole Relay Ecosystem Contract and must also implement a "receiveRelay" function in their contracts, which will be called by the relayer. Once a delivery has been requested, the VAA is guaranteed to be delivered within a certain timeframe. The specifics of this vary by blockchain and smart contract runtime.

Generic relayers have the following benefits:

    - They feature simplified UX
    - There are no relayer infrastructure requirements for the developer

And potential downsides:

    - They require all calculations to be done on-chain
    - They sometimes have less gas efficiency
    - They may not be supported on all chains

Overall, Generic Relayers simplify both the developer and user experience. They're a great choice if they cover all your usecases.

---

In the next section, we'll discuss the xAsset module, which allows xAssets to be created and moved freely around the ecosystem.

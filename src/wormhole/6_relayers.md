# Relayers

Relayers are a major part of the Wormhole Ecosystem. Where the Guardian Network is effectively the 'read' portion of interoperability, relayers are the 'write' portion.

The definition of a _Relayer_ in the context of Wormhole is: Any process which delivers VAAs to a destination.

Unlike other interoperability protocols, Wormhole **does not have a required relaying methodology**.

In most designs there is a dedicated relaying mechanism which operates inside the protocol's trust boundaries. This means that the relayer either has an adversarial relationship to the oracle, or the relayer has trust assumptions and contributes to the protocol's security model. Relayers are usually a trusted party, are often also privileged, and developers are typically forced to use the relayer model built into the protocol.

In Wormhole, relayers are neither trusted nor privileged. This means relayers **cannot jeopardize security, only liveness**. Because Wormhole is designed to have a firm trust boundary at the level of the VAA, relayers have exactly the same capabilities as any regular, untrusted blockchain user.

From this perspective, relayers are just delivery trucks that deliver VAAs to their destination, and have no capacity to tamper with the delivery outcome. VAAs either get delivered or don't, which makes relayers analagous to the off-chain 'crank turners' of traditional Dapps.

As a result, Wormhole is able to facilitate a variety of heterogenous relaying mechanisms, and the developer is able to choose whatever best suit their needs.

Next, we'll go over a few of the most common relaying strategies.

## Client-side Relaying

All simple processes on Wormhole essentially boil down to a three step process:

    1. Perform an action on chain A.
    2. Retrieve the resulting VAA from the Guardian Network.
    3. Perform an action on chain B using the VAA.

Considering that the first step of this process is almost always initiated from a user-facing frontend like a webpage or a wallet, it is possible to also perform steps 2 and 3 in the frontend as well. This is referred to as 'client-side relaying', and it has two major benefits:

- Low cost. Users pay exactly the transaction fee for the second transaction.
- No backend relaying infrastructure.

That makes client-side relaying a tempting prospect, especially if you're just interested in getting an MVP running. However, client-side relaying also has two notable drawbacks:

- Users must sign all transactions required with their own wallet.
- Users must have funds to pay the transaction fees on every chain involved.

Overall, client-side relaying is a simple solution, but can make the user experience cumbersome. It's generally not recommended if your goal is a highly-polished user experience.

## Specialized Relayers

Specialized relayers solve the UX problems of client-side relayers by adding a backend component which can handle steps 2 and 3 on behalf of the user.

In this model, relayers either listen directly to the Guardian Network via a spy (This is called **Spy Relaying**), or will simply provide a REST endpoint to accept a VAA which should be relayed (called **REST Relaying**). Once a relayer has the VAA, it simply performs any necessary off-chain calculations and submits the VAA to the required destination.

An important consideration when developing a specialized relayer is that the relayer is still considered untrusted. VAAs are public and can be submitted by anyone, so the off-chain relayer should not do any computation which is considered "trusted." However, doing things like deterministic data transforms, waiting for gas prices to drop, or various forms of 'batching' can be very useful cost-reduction strategies that do not impact security.

Specialized Relayers have the following advantages:

    - They simplify user experience
    - They allow off-chain calculations to be performed in the relayer, reducing gas costs
    - They are generally easy to develop

However, they also have a couple notable downsides

    - They add a backend relaying component which is responsible for liveness
    - They can complicate fee-modeling, as relayers are responsible for paying target chain fees.

Because relayers are responsible for liveness, they become another dependency component for the xDapp. If the relayers are all down, your application has an outage. This is similar to how dependencies like the frontend, blockchain nodes, blockchains, third party APIs, etc, can also cause outages.

To mitigate this, multiple relayers can be run in order to provide redundancy. It's also possible to design specialized relaying solutions which are entirely decentralized, such that there are a network of relayers which run based off economic incentives. However, creating a robust model for decentralized relaying is generally application-specific and complex.

Due to specialized relayers being such a common solution, there is a reference implementation provided in the main Wormhole repository which stands up the infrastructure needed to provide a Spy interface, a REST interface and the ability to interact with each blockchain in the ecosystem. If you plan to develop a specialized relayer, consider starting from the reference implementation and add modifications as needed.

# Generic Relayers

_Note: this feature is not yet available in mainnet_

Because relaying is such an integral component to xDapps, Wormhole has built a protocol which allows developers to utilize a decentralized network of untrusted relayers to deliver their messages, removing the specialized relayer as an infrastructure responsibility.

In order to utilize the generic relayer network, developers must request delivery from the Wormhole Relay Ecosystem Contract and must also implement a "receiveRelay" function in their contracts, which will be called by the relayer. Once a delivery has been requested, the VAA is guaranteed to be delivered within a certain timeframe. The specifics of this vary by blockchain and smart contract runtime.

Generic relayers have the following benefits:

    - They feature simplified UX
    - There are no relayer infrastructure requirements for the developer

And potential downsides:

    - They require all calculations to be done on-chain
    - They have less gas efficiency
    - They may not be supported on all chains

---

In the next section, we'll discuss the Portal Ecosystem contracts that allow xAssets to be created and moved freely around the ecosystem.

# Core Contracts

The Wormhole Core Contracts are one of the most pivotal pieces of the Wormhole ecosystem, and serve as a great place to start when learning about how data flows through the ecosystem.

There is one Core Contract on each blockchain in the ecosystem, and this is the contract which the Guardians are required to observe. The Core Contracts are the mechanism by which all Wormhole messages are emitted. All xDapps either interact directly with the Core Contract, or interact with some other contract which does.

The Core Contracts are quite simple and only have a few public-facing functions.

---

    publishMessage(
        int nonce,
        byte[] payload,
        int consistencyLevel
    ) returns int sequenceNumber

This is the mechanism by which Wormhole Messages are emitted.

- **payload** is an arbitrary byte array, and is the content of the emitted message. It may be capped to a certain maximum length due to the constraints of individual blockchains.
- **consistencyLevel** is the number of blocks which the guardians should wait prior to emitting a VAA for this message. This number is usually either 1, or equal to the chain's finality period. This is a defense against transactions being orphaned.
- **nonce** - on chains where batch VAAs are supported, if multiple messages in the same transaction have the same nonce, a batch VAA will be produced alongside the individual VAAs. This feature reduces gas costs and simplifies composeability.

- **sequenceNumber** - this is a unique index number for the message. When combined with the emitter contract address and emitter chain ID, the corresponding VAA can be retrieved from a guardian network node.

The implementation strategy for publishMessage differs by chain. However, the general strategy is that the Core Contract will post the emitterAddress (the contract which called publishMessage), sequenceNumber, and consistencyLevel into the blockchain logs. Once the desired consistencyLevel has elapsed, the Guardian Network will produce the requested VAAs.

Currently there are no fees to publish a message, except when publishing on Solana. This is not guaranteed to always be the case, however.

---

Second, we have 'receiving' side of the Core contract.

    parseAndVerifyVAA( byte[] VAA )

This function, when passed a VAA, will either return the payload and associated metadata for the VAA, or throw an exception. An exception should only ever throw if the VAA fails signature verification, which would indicate that the VAA is invalid or inauthentic in some form.

---

## Multicasting

Let's take a moment to point out that there is no inclusion of any destination address or chain in these functions.

VAAs simply attest that "This contract on this chain said this thing". Therefore, VAAs are multicast by default, and will be verified as authentic on any chain they are brought to.

This multicast-by-default model is intentional, and also integral to the design. Having this multicast capacity makes it easy to synchronize state across the entire ecosystem, because a single blockchain can make its data available to every chain in a single action with low latency. This, in turn, reduces the complexity of the n^2 problems encountered by routing data to a large number of blockchains.

Use cases where the message has an intended recipient or is only meant to be consumed once must be handled in logic outside the Core Contract. There are standard practices for accomplishing these features shown later on in the code examples, and some ecosystem contracts (namely Portal & the Relaying contract) handle this on behalf of downstream consumers.

Lastly, because the VAA creation is a separate concern from relaying, there is _no additional cost_ to this multicast model when a single chain is being targetted. If the data isn't needed on a certain blockchain, don't relay it there, and it won't cost anything.

In the next section we'll dive into the technical specfications of the VAA.

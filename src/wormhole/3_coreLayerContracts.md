# Core Contracts

The Core Contracts are the mechanism by which all Wormhole messages are emitted. All xDapps either interact directly with the Core Contract or interact with another contract that does. There is one Core Contract on each blockchain in the ecosystem, and this is the contract which the Guardians are required to observe. 

The Wormhole Core Contracts are one of the most pivotal pieces of the Wormhole ecosystem. They serve as a great place to start when learning about how data flows through the ecosystem.

In general, Core Contracts are simple and can be broekn down to a **sending** and **receiving** side, which we'll define next.

### Sending

Below is the mechanism by which Wormhole messages (aka Verified ACtion Approval, VAA) are emitted:

    publishMessage(
        int nonce,
        byte[] payload,
        int consistencyLevel
    ) returns int sequenceNumber

 Let's break it down a bit:

- **payload** - The content of the emitted message and an arbitrary byte array. It may be capped to a certain maximum length due to the constraints of individual blockchains.

- **consistencyLevel** - The number of blocks which the Guardians should wait prior to emitting a VAA for this message. This number is usually either 1 or equal to the chain's finality period. This is a defense against transactions being orphaned.

- **nonce** -  An index number for the message that is used to produce Batch VAAs. How this is generated is elaborated in the [CoreLayer](../technical/evm/coreLayer.md) section.

- **sequenceNumber** - A unique index number for the message. When combined with the emitter contract address and emitter chain ID, the corresponding VAA can be retrieved from a guardian network node.

The implementation strategy for publishMessage differs by chain, but the general strategy consists of the Core Contract posting the emitterAddress (the contract which called publishMessage), sequenceNumber, and consistencyLevel into the blockchain logs. Once the desired consistencyLevel has elapsed and the message passes all of the Guardians' optional checks, the Guardian Network will produce the requested VAAs.

Currently there are no fees to publish a message (with the exception of publishing on Solana) but this is not guaranteed to always be the case in the future.

### Receiving

Below is the mechanism by which VAAs are received:

    parseAndVerifyVAA( byte[] VAA )

When passed a VAA, this function will either return the payload and associated metadata for the VAA or throw an exception. An exception should only ever throw if the VAA fails signature verification, indicating the VAA is invalid or inauthentic in some form.

---

## Multicasting

Let's take a moment to point out that there is no destination address or chain in these functions.

VAAs simply attest that "this contract on this chain said this thing." Therefore, VAAs are multicast by default and will be verified as authentic on any chain they are brought to.

This multicast-by-default model is integral to the design. Having this multicast capacity makes it easy to synchronize state across the entire ecosystem, because a single blockchain can make its data available to every chain in a single action with low latency. This reduces the complexity of the n^2 problems encountered by routing data to a large number of blockchains.

Use cases where the message has an intended recipient or is only meant to be consumed a single time must be handled in logic outside the Core Contract. There are standard practices for accomplishing these features later on in the code examples, and some ecosystem contracts (namely Token Bridge & the Relaying contract) handle this on behalf of downstream consumers.

Lastly, because the VAA creation is separate from relaying, there is _no additional cost_ to the multicast model when a single chain is being targetted. If the data isn't needed on a certain blockchain, don't relay it there, and it won't cost anything.

---

In our next section, we'll dive into the technical specfications of the VAA.

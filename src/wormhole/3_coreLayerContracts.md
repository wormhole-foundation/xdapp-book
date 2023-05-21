# Core Contracts

The Core Contracts are the mechanism by which all Wormhole messages are emitted. All xDapps either interact directly with the Core Contract or interact with another contract that does. There is one Core Contract on each blockchain in the ecosystem, and this is the contract which the Guardians are required to observe.

The Wormhole Core Contracts are one of the most pivotal pieces of the Wormhole ecosystem. They serve as a great place to start when learning about how data flows through the ecosystem.

In general, Core Contracts are simple and can be broken down to a **sending** and **receiving** side, which we'll define next.

### Sending

Below is the mechanism by which Wormhole messages (aka Verified Action Approval, VAA) are emitted:

    publishMessage()(
        int nonce,
        byte[] payload,
        int consistencyLevel
    ) returns int sequenceNumber

Let's break it down a bit:

- **payload** - The content of the emitted message and an arbitrary byte array. It may be capped to a certain maximum length due to the constraints of individual blockchains.

- **consistencyLevel** - The level of finality to reach before emitting the Wormhole VAA. This is a defense against reorgs and rollbacks.

- **nonce** - An index number for the message that is used to produce Batch VAAs. How this is generated is elaborated in the [CoreLayer](../technical/evm/coreLayer.md) section.

- **sequenceNumber** - A unique index number for the message. When combined with the emitter contract address and emitter chain ID, the corresponding VAA can be retrieved from a guardian network node.

The implementation strategy for publishMessage differs by chain, but the general strategy consists of the Core Contract posting the emitterAddress (the contract which called publishMessage), sequenceNumber, and consistencyLevel into the blockchain logs. Once the desired consistencyLevel has been reached and the message passes all of the Guardians' optional checks, the Guardian Network will produce the requested VAAs.

Currently there are no fees to publish a message (with the exception of publishing on Solana) but this is not guaranteed to always be the case in the future.

### Receiving

Below is the mechanism by which VAAs are received:

    parseAndVerifyVAA( byte[] VAA )

When passed a VAA, this function will either return the payload and associated metadata for the VAA or throw an exception. An exception should only ever throw if the VAA fails signature verification, indicating the VAA is invalid or inauthentic in some form.

---

## Consistency Levels

The goal of Wormhole is to provide high confidence that, by default, only finalized messages are observed and attested. Different chains use different consensus mechanisms and so there are different finality assumptions with each one. Some advanced integrators may want to get messages _before_ finality, which is where the `consistencyLevel` field offers chain-specific flexibility.

| Chain Name          | Wormhole Chain ID | Instant         | Safe                                                                  | Finalized                                                                                                               |
| :------------------ | :---------------- | :-------------- | :-------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| Solana              | 1                 | 0 (`confirmed`) |                                                                       | 1 (`finalized`)                                                                                                         |
| Ethereum            | 2                 | 200             | 201 (`safe`)                                                          | 1 (`finalized`)                                                                                                         |
| Binance Smart Chain | 4                 | 200             |                                                                       | 15 (recommended blocks)                                                                                                 |
| Polygon             | 5                 | 200             |                                                                       | 1 ([checkpoint](https://wiki.polygon.technology/docs/pos/heimdall/checkpoint/))                                         |
| Avalanche (C-Chain) | 6                 | 200             |                                                                       | 1 (instant finality)                                                                                                    |
| Oasis (Emerald)     | 7                 | 200             |                                                                       | 1 (instant finality)                                                                                                    |
| Fantom              | 10                | 200             |                                                                       | 1 (instant finality)                                                                                                    |
| Karura              | 11                | 200             |                                                                       | 1 (safe mode)                                                                                                           |
| Acala               | 12                | 200             |                                                                       | 1 (safe mode)                                                                                                           |
| Klaytn              | 13                | 200             |                                                                       | 1 (instant finality)                                                                                                    |
| Celo                | 14                | 200             |                                                                       | 1 (instant finality)                                                                                                    |
| Moonbeam            | 16                | 200             |                                                                       | 1 ([`moon_isBlockFinalized`](https://docs.moonbeam.network/builders/build/moonbeam-custom-api/#finality-rpc-endpoints)) |
| Arbitrum            | 23                | 200             |                                                                       | 1 (L1 block `finalized`)                                                                                                |
| Optimism            | 24                | 200             | [coming soon](https://community.optimism.io/docs/developers/bedrock/) | 1 (L1 block `finalized`)                                                                                                |

---

## Multicasting

Let's take a moment to point out that there is no destination address or chain in these functions.

VAAs simply attest that "this contract on this chain said this thing." Therefore, VAAs are multicast by default and will be verified as authentic on any chain they are brought to.

This multicast-by-default model is integral to the design. Having this multicast capacity makes it easy to synchronize state across the entire ecosystem, because a single blockchain can make its data available to every chain in a single action with low latency. This reduces the complexity of the n^2 problems encountered by routing data to a large number of blockchains.

Use cases where the message has an intended recipient or is only meant to be consumed a single time must be handled in logic outside the Core Contract. There are standard practices for accomplishing these features later on in the code examples, and some ecosystem contracts (namely Token Bridge & the Relaying contract) handle this on behalf of downstream consumers.

Lastly, because the VAA creation is separate from relaying, there is _no additional cost_ to the multicast model when a single chain is being targeted. If the data isn't needed on a certain blockchain, don't relay it there, and it won't cost anything.

---

In our next section, we'll dive into the technical specifications of the VAA.

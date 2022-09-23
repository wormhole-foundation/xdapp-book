# VAAs (Verified Action Approvals)

VAAs are the core messaging primative in Wormhole. You can think of them as packets of xData that are emitted any time an xDapp contract interacts with the Core Contract.

The basic VAA has two components--a Header and a Body.

## Header

    byte        version                  (VAA Version)
    u32         guardian_set_index       (Indicates which guardian set is signing)
    u8          len_signatures           (Number of signatures stored)
    [][66]byte  signatures               (Collection of ecdsa signatures)

The Header is used by the Core Contract to determine the authenticity of the VAA, but can generally be ignored by other consumers.

## Body

    u32         timestamp                 (Timestamp of the block where the source transaction occurred)
    u32         nonce                     (A grouping number)
    u16         emitter_chain             (Wormhole ChainId of emitter contract)
    [32]byte    emitter_address           (Emitter contract address, in Wormhole format)
    u64         sequence                  (Strictly increasing sequence, tied to emitter address & chain)
    u8          consistency_level         (How many blocks were waited before emitting this VAA)
    []byte      payload                   (VAA message content)

The Body is the relevant information for consumers and is handed back from parseAndVerifyVAA. Because the emitterAddress is included as part of the Body, the developer is able to tell if this VAA originated from a trusted contract.

VAAs are uniquely indexed by their emitterChain, emittedAddress and sequence. They can be obtained by querying a node in the Guardian Network with this information.

Because baseline VAAs have no destination, they are effectively multicast. They will be verified as authentic by any Core Contract on any chain in the network. If a VAA has a specific destionation, it is entirely the responsibility of relayers to complete that delivery appropriately.

## Batch VAAs

Certain blockchains support version 2 VAAs, also referred to as **Batch VAAs** which are designed to provide an easier paradigm for composability and better gas efficiency when multiple cross-chain actions are involved in a single transaction.

Batch VAAs are designed to be automatically generated for all messages that come from a single transaction. 

In an extreme composability scenario or advanced integration, there may be some messages in a transaction that may not be relevant to one another. To control the create of additional batches, some messages can be created with the same `nonce` to _additionally_ group them.

It is of note that Single VAAs will always be emitted for each message generated, regardless of it they are contained in a Batch VAA or not.

Go [here](../technical/evm/coreLayer.md) for a more detailed description of how Batch VAAs are generated.

_Note: Batch VAAs are not currently live on mainnet, but will have initial support on all EVM chains when they launch._

> How to leverage Batch VAAs 
> 
> Imagine a transaction generates three messages (A, B, C) that a consuming contract needs to know about.
> 
> If each message is independent of each other, the consuming contract can handle and validate each of these VAAs individually like [A], [B], [C].
>
> If all of the messages are related to each other, the consuming contract can handle and validate the Batch VAA of the entire transaction that is automatically generated like [A, B, C].
>
> If only two of the messages are related to each other, say A and C, the same `nonce` can be used for those two messages to generate an additional Batch VAA and the consuming contract can then handle and validate two sets of VAAs like [A, C] and [B].

---

In the next section, we'll give an overview of how the Wormhole Guardian network creates VAAs along with a look at the key design considerations that underpin the network.

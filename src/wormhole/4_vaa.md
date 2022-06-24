# VAAs (Verified Action Approval)

VAAs are the core messaging primative in Wormhole. You can think of them as packets of xData. Any time an xDapp contract interacts with the Core Contract, a VAA is emitted.

The basic VAA has two components, a Header and a Body.

## Header

    byte        version                  (VAA Version)
    u32         guardian_set_index       (Indicates which guardian set is signing)
    u8          len_signatures           (Number of signatures stored)
    [][66]byte  signatures               (Collection of ecdsa signatures)

The header is used by the Core Contract to determine the authenticity of the VAA, but can generally be ignored by other consumers.

## Body

    u32         timestamp                 (Timestamp of the block where the source transaction occurred)
    u32         nonce                     (A grouping number)
    u16         emitter_chain             (Wormhole ChainId of emitter contract)
    [32]byte    emitter_address           (Emitter contract address, in Wormhole format)
    u64         sequence                  (Strictly increasing sequence, tied to emitter address & chain)
    u8          consistency_level         (How many blocks were waited before emitting this VAA)
    []byte      payload                   (VAA message content)

The body is the relevant information for consumers, and is handed back from parseAndVerifyVAA. Because the emitterAddress is included as part of the body, the developer is able to discern if this VAA originated from a trusted contract.

VAAs are uniquely indexed by their emitterChain, emittedAddress, and sequence. VAAs can be obtained by querying a node in the Guardian Network with this information.

Because baseline VAAs have no destination, they are effectively multicast. They will be verified as authentic by any Core Contract on any chain in the network, and it is entirely the responsibility of relayers to deliver VAAs to the appropriate destination.

## Batch VAAs

Certain blockchains support version 2 VAAs, also referred to as **Batch VAAs**. When multiple messages with the same nonce are emitted in the same transaction, a batch VAA will be created in addition to the individual VAAs. The Batch VAA contains the body of each individual VAA, but only has a single header. This reduces the gas cost of verifying the VAA, and also simplifies the process of relaying and consuming multiple VAAs.

Batch VAAs are not currently live on mainnet, but will have initial support on all EVM chains when they launch.

---

In the next section, we will give an overview of how the Wormhole Guardian network creates these VAAs, and the key design considerations which underpin the network.

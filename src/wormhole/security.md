# Security

Let's take a moment to pause and spell out the most important security elements of Wormhole before proceeding.

</br>
</br>

**What are the Core Security Assumptions of Wormhole?**

- Wormhole's core security primative is its signed messages (signed VAAs).

- The Guardian network is currently secured by a collection of 19 of the world's top validator companies, [listed here](https://wormhole.com/network/).
- Guardians produce signed state attestations (signed VAAs), when requested by a Core Contract integrator.
- Every Guardian runs full nodes (rather than light nodes) of every blockchain in the Wormhole network. This means that if a blockchain suffers a consensus attack or hard fork, the blockchain will disconnect from the network, rather than potentially produce invalid signed VAAs.

- Any Signed VAA can be verified as authentic by the Core Contract of any other chain.

- Relayers are considered untrusted in the Wormhole ecosystem.

</br>

> In summary:
>
> - **Core integrators aren't exposed to risk from chains and contracts they don't integrate with**.
>
> - By default, you only trust Wormhole's signing process and the Core Contracts of the chains you're on.
>
> - You can expand your contract and chain dependencies as you see fit.

---

</br>

Core assumptions aside, there are many other factors which impact the real-world security of decentralized platforms. Here is more information on additional measures which have been put in place to ensure the security of Wormhole.

</br>

## Audits & Bug Bounties

Wormhole has been heavily audited, with **16 third-party audits completed** and a total of **26 started**. Additionally it has two bug bounty programs available - one self-hosted program, and one through [Immunifi](https://immunefi.com/).

More information about the bug bounty programs, as well as the most up-to-date list of audit reports is available [here](https://github.com/wormhole-foundation/wormhole/blob/main/SECURITY.md)
</br>

## Guardian Network

Wormhole is an evolving platform. While the Guardian set currently comprises 19 validators, this is mostly a limitation of current blockchain technology. The aim of Wormhole is that the security of the Guardian Network will expand overtime, and that **eventually Guardian signatures will be replaced entirely by state proofs**. [More info in this previous section](./5_guardianNetwork.md).

</br>

## Governance

Since the launch of Wormhole v2, all Wormhole governance actions and contract upgrades have been managed via Wormhole's **on-chain governance system**. Guardians manually vote on governance proposals which originate inside the Guardian Network and are then submitted to ecosystem contracts. This means that **contract upgrades are held to the same security standard** as the rest of the system.

The Governance system is fully open source in the core repository. Here are some relevant contracts:

- [Ethereum Core Governance](https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/bridge/BridgeGovernance.sol)
- [Solana Core Governance API](https://github.com/wormhole-foundation/wormhole/blob/main/solana/bridge/program/src/api/governance.rs)

</br>

## Wormchain & Asset Layer Protections

One of the most powerful aspects of the Wormhole ecosystem is that Guardians effectively have **the entire state DeFi available to them**.

Wormchain is a Cosmos based blockchain which runs internally to the Guardian network, whereby the Guardians can effectively execute smart contracts against the current state of all blockchains, rather than just one blockchain.

This enables two additional protections for the Wormhole Asset Layer in addition to the core assumptions:

- **Governor:** The Governor tracks inflows and outflows of all blockchains and delays suspicious transfers which may be indicative of a exploit. [More Info](https://github.com/wormhole-foundation/wormhole/blob/dev.v2/whitepapers/0007_governor.md)
- **Global Accountant:** The accountant tracks the total circulating supply of all Wormhole assets across all chains and prevents any blockchain from bridging assets which would violate the supply invariant.

</br>

## Always Open Source

Lastly, Wormhole builds in the open and is always open source.

- [Wormhole Core Repository](https://github.com/wormhole-foundation/wormhole)

- [Wormhole Foundation Github Organization](https://github.com/wormhole-foundation)

- [Wormhole Contract Deployments](../reference/contracts.md)

</br>

## Learn More

- The [SECURITY.md](https://github.com/wormhole-foundation/wormhole/blob/main/SECURITY.md) from the official repository has the latest security policies and updates.

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

## Audits

Wormhole has been heavily audited, with **16 third-party audits completed** and a total of **25+ started**.

Wormhole has had audits performed by the following firms, and continues to seek more:

- Trail of Bits
- Neodyme
- Kudelski
- OtterSec
- Certik
- Hacken
- Zellic
- Coinspect
- Halborn

The most up-to-date list of audits, as well as the final reports can be found [here](https://github.com/wormhole-foundation/wormhole/blob/main/SECURITY.md#3rd-party-security-audits)

</br>

## Bug Bounties

Wormhole has one of the largest bug bounty programs in all of software development, and has repeatedly shown commitment to engaging with the white hat community.

Wormhole hosts two bug bounty programs:

- An [Immunifi](https://immunefi.com/) program,
- As well as a [self-hosted program](https://wormhole.com/bounty/)

Both platforms have a top payout of **2.5 million dollars**.

If you are interested in helping contribute to Wormhole security, please look at this section for [Getting started as a White Hat](https://github.com/wormhole-foundation/wormhole/blob/main/SECURITY.md#white-hat-hacking), and be sure to follow the [Wormhole Contributor Guidelines](https://github.com/wormhole-foundation/wormhole/blob/main/CONTRIBUTING.md).

For more information about submitting to the bug bounty programs, look [here](https://wormhole.com/bounty/)

</br>

## Guardian Network

Wormhole is an evolving platform. While the Guardian set currently comprises 19 validators, this is mostly a limitation of current blockchain technology. The aim of Wormhole is that the the Guardian Network will expand overtime, and that **eventually Guardian signatures will be replaced entirely by state proofs**. [More info in this previous section](./5_guardianNetwork.md).

</br>

## Governance

Since the launch of Wormhole v2, all Wormhole governance actions and contract upgrades have been managed via Wormhole's **on-chain governance system**.

Guardians manually vote on governance proposals which originate inside the Guardian Network and are then submitted to ecosystem contracts. This means that **governance actions are held to the same security standard** as the rest of the system. A 2/3 supermajority of the Guardians are required to pass any Governance action.

Via governance, the Guardians are able to:

- Change the current Guardian set
- Expand the Guardian set
- Upgrade ecosystem contract implementations

The Governance system is fully open source in the core repository. Here are some relevant contracts:

- [Ethereum Core Governance](https://github.com/wormhole-foundation/wormhole/blob/main/ethereum/contracts/bridge/BridgeGovernance.sol)
- [Solana Core Governance API](https://github.com/wormhole-foundation/wormhole/blob/main/solana/bridge/program/src/api/governance.rs)

</br>

## Monitoring

A key element of Wormhole's defense-in-depth strategy is that each Guardian is a highly-competent validator company with their own in-house processes for running, monitoring, and securing blockchain operations. This heterogenous approach to monitoring increases the likelihood that fraudulent activity is detected and reduces the number of single failure points in the system.

Guardians are not just running Wormhole validators, they're running validators for **every blockchain inside of Wormhole as well**, which allows them to perform monitoring **holistically across decentralized computing**, rather than just at a few single points.

Guardians Monitor:

- Block Production & Consensus of each blockchain. If a blockchain's consensus is violated it disconnects from the network until the Guardians resolve the issue.

- Smart Contract level data. Via processes like the Governor, Guardians constantly monitor the circulating supply and token movements across all supported blockchains.

- Guardian Level activity. The Guardian Network functions as an autonomous decentralized computing network, complete with its own blockchain (Wormchain).

</br>

## Wormchain & Asset Layer Protections

One of the most powerful aspects of the Wormhole ecosystem is that Guardians effectively have **the entire state DeFi available to them**.

Wormchain is a Cosmos based blockchain which runs internally to the Guardian network, whereby the Guardians can effectively execute smart contracts against the current state of all blockchains, rather than just one blockchain.

This enables two additional protections for the Wormhole Asset Layer in addition to the core assumptions:

- **Governor:** The Governor tracks inflows and outflows of all blockchains and delays suspicious transfers which may be indicative of a exploit. [More Info](https://github.com/wormhole-foundation/wormhole/blob/main/whitepapers/0007_governor.md)
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

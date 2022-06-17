# Summary

[Introduction](./introduction/introduction.md)

---

# Overview

- [xDapps](./dapps/0_xdappOverview.md)

  - [Dapp Ecosystem Basics](./dapps/1_defiBasics.md)
  - [Cross-Chain Interoperability](./dapps/2_crossChainInteroperability.md)
  - [xData & xAssets](./dapps/3_xdataxassets.md)
  - [What is an xDapp?](./dapps/4_whatIsanXdapp.md)
  - [Advantages of xDapps](./dapps/5_advantages.md)

- [Wormhole](./wormhole/wormholeOverview.md)
  - [What is Wormhole?](./wormhole/whatIsWormhole.md)
  - [Architecture Overview](./wormhole/architectureOverview.md)
  - [Guardian Network](./wormhole/guardianNetwork.md)
  - [Core Layer Contracts](./wormhole/coreLayerContracts.md)
  - [VAA: Verifiable Action Approval](./wormhole/vaa.md)
  - [Relayers](./wormhole/relayers.md)
  - [Portal xAsset Bridge](./wormhole/portalTokenBridge.md)
  - [Wormchain](./wormhole/wormchain.md)

---

# xDapp Architecture

- [xDapp Design]()
  - [Key Considerations]()
  - [Ecosystems]()
    - [EVM]()
    - [Solana]()
    - [Cosmos]()
    - [Algorand]()
  - [Protocol-First Design]()
  - [Topology]()
    - [Hub & Spoke]()
    - [Mesh]()
  - [xAssets]()
  - [Relayers]()
    - [Generic Relayers]()
    - [Protocol-Specific Relayers]()
  - [Security]()
    - [Trust Assumptions]()
    - [Layer 1 Risk]()
    - [Finality Guarantees]()
  - [Examples]()
    - [Cross-Chain Swap]()
    - [Remote Staking]()
  - [Common Use Cases]()
  - [FAQ]()

---

# xDapp Development

- [Before You Start]()
  - [Choosing an Environment]()
- [Tilt Installation](./development/tilt/overview.md)
  - [MacOS](./development/tilt/mac.md)
  - [Linux](./development/tilt/linux.md)
  - [Constants](./development/tilt/constants.md)
- [Project Scaffold](./development/scaffold/overview.md)
  - [EVM]()
    - [Foundry]()
  - [Solana]()
    - [Solana CLI]()
    - [Anchor]()
  - [Algorand]()
  - [CosmWasm]()
- [Sending Messages](./development/messages/sending/overview.md)
  - [EVM](./development/messages/sending/evm.md)
  - [Solana]()
  - [Algorand]()
  - [CosmWasm]()
- [Registering xDapps](./development/messages/registration/overview.md)
  - [EVM](./development/messages/registration/evm.md)
  - [Solana]()
  - [Algorand]()
  - [CosmWasm]()
- [Relaying Messages](./development/messages/relaying/overview.md)
  - [Manual Relays]()
  - [REST & Spy Relayer]()
  - [Generic Relayers]()
- [Receving Messages](./development/messages/receiving/overview.md)
  - [EVM](./development/messages/receiving/evm.md)
  - [Solana]()
  - [Algorand]()
  - [CosmWasm]()
- [Projects](./projects/summary.md)
  - [Messenger](./projects/messenger/introduction.md)
    - [Prerequistes]()
      - [EVM]()
  - [Lever Puzzle]()
---

# Portal Token Bridge

- [Portal]()
  - [Portal JS Client Transfers]()
  - [Payload 1 Transfers]()
  - [Payload 2 Attestations]()
  - [Payload 3 Contract Controlled Transfers]()
  - [Examples]()
    - [EVM to Solana Transfer]()
    - [Polygon to Oasis with Relayers]()
  - [Portal Payloads]()

---

# Other Resources

- [Glossary]()
- [Reference]()
  - [Tools](./reference/tools.md)
  - [Github & Useful Links](./reference/github.md)
  - [Deployed Contracts](./reference/contracts.md)
  - [RPC Nodes](./reference/rpcnodes.md)

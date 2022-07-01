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

- [Wormhole](./wormhole/0_wormholeOverview.md)
  - [What is Wormhole?](./wormhole/1_whatIsWormhole.md)
  - [Architecture Overview](./wormhole/2_architectureOverview.md)
  - [Core Layer Contracts](./wormhole/3_coreLayerContracts.md)
  - [VAA: Verified Action Approval](./wormhole/4_vaa.md)
  - [Guardian Network](./wormhole/5_guardianNetwork.md)
  - [Relayers](./wormhole/6_relayers.md)
  - [Portal xAsset Bridge](./wormhole/7_portalTokenBridge.md)
  - [Wormchain](./wormhole/8_wormchain.md)

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

- [Before You Start](./development/overview.md)
- [Wormhole Local Validator](./development/wormhole-local-validator.md)
- [Tilt Installation](./development/tilt/overview.md)
  - [MacOS](./development/tilt/mac.md)
  - [Linux](./development/tilt/linux.md)
  - [Constants](./development/tilt/constants.md)
- [Project Scaffold](./development/scaffold/overview.md)
- [Sending Messages](./development/messages/sending/overview.md)
  - [EVM](./development/messages/sending/evm.md)
- [Registering xDapps](./development/messages/registration/overview.md)
  - [EVM](./development/messages/registration/evm.md)
- [Relaying Messages](./development/messages/relaying/overview.md)
  - [Manual Relays]()
  - [REST & Spy Relayer]()
  - [Generic Relayers]()
- [Receving Messages](./development/messages/receiving/overview.md)
  - [EVM](./development/messages/receiving/evm.md)
- [Projects](./projects/summary.md)
  - [EVM Messenger](./projects/evm-messenger/overview.md)
    - [Solidity](./projects/evm-messenger/messenger.md)
    - [JS Client](./projects/evm-messenger/client.md)
---

# Portal Token Bridge

- [Portal](./development/portal/overview.md)
  - [EVM]()
    - [Attesting](./development/portal/evm/attestingToken.md)
    - [Transfer Tokens](./development/portal/evm/tokenTransfer.md)
  - [Portal JS Client Transfers]()
    - [EVM to Solana Transfer]()
    - [Polygon to Oasis with Relayers]()
- [Portal Payloads]()

---

# Other Resources

- [Reference]()
  - [Tools](./reference/tools.md)
  - [Github & Useful Links](./reference/github.md)
  - [Deployed Contracts](./reference/contracts.md)
  - [RPC Nodes](./reference/rpcnodes.md)

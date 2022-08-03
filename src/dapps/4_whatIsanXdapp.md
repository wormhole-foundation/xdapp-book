# What is an xDapp?

The term **xDapp** is short for "Cross-Chain Decentralized Application". At first glance, this might give the impression that xDapps are simply Dapps that  do cross-chain things. However, once you start building decentralized products designed to operate across a variety of blockchains and runtimes, it becomes clear that these applications are architected in a fundamentally different way than traditional Dapps.

xDapps have the capacity to perform all the operations of traditional Dapps, but they are also able to utilize xData. xData allows xDapp developers to build from a top-down, message-passing approach, rather than the bottom-up world of Dapp development. The Wormhole Core Layer implements xData, which acts as a shared repository of data across the entire Wormhole ecosystem.

Something we'll explore further in the upcoming xDapp Architecture chapter is the philosophy of **Protocol-First Design**. Protocol First Design is an approach to building decentralized applications where the first order of business is to lay out your application into a series of data structures, APIs and message payloads. Once you've laid out your application into a high-level protocol, the protocol acts as an agreement to which all components must adhere. From there, the smart contracts underlying the protocol can be considered an implementation detail.

If you're familiar with web2 development, you might notice that this philosophy is analogous to microservice architecture. This is no coincidence, as similar problems should expect to be solved by similar solutions, and the Wormhole Core Layer has a number of parallels to the OSI Network Model.

Thus, a more fitting depiction of xDapps might be to see them as **Distributed Decentralized Applications** with multiple, specialized components working in unison to deliver a smooth, unified user experience across a variety of layer 1 ecosystems.

## Branded Terms

In some instances, Wormhole uses general terms for decentralized, cross-chain elements as branded verbiage. In most cases, the definition of the general term does not greatly differ from Wormhole definition, though Wormhole's definitions may be more narrow than general interpretations. 

**xApp** - In the Wormhole xChain ecosystem, the term "xDapp" has been shortened to "xApp." These cross-chain applications are largely still decentralized, but for branding and simplicity purposes, the term "xApp" will be prioritized over "xDapp" when talking about Wormhole's xChain ecosystem.

In the next section, we'll summarize the concrete advantages which xDapps built on Wormhole have over traditional Dapps today.

# Protocol Design

Wormhole's key feature is that it brings message passing to the world of blockchain. As such, it's worthwhile to take some inspiration from other areas of software development which are based on similar principles.

Much of the traditional web stack is based on distributed systems, which rely on message passing to create well-defined interfaces and boundaries for disparate systems to work together. We should similarly think of xDapps as web3 distributed systems based on similar paradigms.

## Protocol First Design

Protocol first design is a design philosophy where you first lay out your data types, message formats, and supported operations into a well-defined protocol. This creates a solid protocol layer which can serve as the foundation for your application, and the code instantiating that protocol can be treated as an implementation detail when reasoning about the protocol itself.

At this stage in the design, you should first consider the incentive structures surrounding your protocol. What is the incentive for each party to engage? Are there economic attack vectors in your application which might jeopardize its security? Do certain market conditions result in perverse outcomes? This stage of the process could be as simple as stating "people will want my NFT", or as difficult as designing an entire ecosystem with multiple competing interests. It depends on what your goals are.

Once you have a clear idea of your core product, incentives, and users, you can begin to lay out your data model, and from there define your message types and operations.

## Common Strategies and Conventions

### Address Space

Because there are many different formats for addresses across the ecosystem, a compatibility format is necessary. Wormhole uses its own address format (generally referred to as Wormhole format) in order to solve this issue. These addresses correspond 1 to 1 with native addresses on each chain.

A Wormhole address consists of a tuple containing the 2 byte Wormhole chain ID, and also a 32 byte shim address. The Wormhole address format is then 34 bytes.

For example, because EVM addresses are only 20 bytes in length, to convert this to a Wormhole address, the address is left-padded with zeros until it's length 32.

When dealing with addresses inside your messages, it's recommended to always convert to Wormhole format and transmit in that format. Primarily because you will regularly encounter these addresses when interacting with parts of the Wormhole ecosystem, but also because it will enhance your forward compatibility as you add more chains to your protocol.

### Trusted Contract Network

If your application has smart contracts deployed to multipe chains, it will be important for your contracts to know which other contracts are 'in network' for your application, as commonly the first check performed when receiving a message is to validate that it originates from a trusted contract.

Generally, this list of trusted contracts is stored in the state of each contract individually, and updating the trusted contracts is tied into the governance mechanism of the application.

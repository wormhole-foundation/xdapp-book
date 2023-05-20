# Protocol Design

They key feature of Wormhole is bringing message passing to the world of blockchain, so it's worthwhile to take some inspiration from other areas of software development that are based on similar principles.

Much of the traditional web stack is based on distributed systems that rely on message passing to create interfaces and boundaries for disparate systems to work together. We can think of xDapps as web3 distributed systems founded on similar paradigms.

## Protocol First Design

Protocol first design is a design philosophy where you initially lay out your data types, message formats and supported operations into a well-defined protocol. This creates a solid protocol layer which can serve as the foundation for your application. This way, the code instantiating that protocol can be treated as an implementation detail when reasoning about the protocol itself.

At this stage in the design, you should also consider the incentive structures surrounding your protocol. What is the incentive for each party to engage? Are there economic attack vectors in your application which might jeopardize its security? Do certain market conditions result in perverse outcomes? 

Depending on your goals, this stage of the process can be as simple as stating "people will want my NFT" or as difficult as designing an entire ecosystem with multiple competing interested parties. 

Once you have a clear idea of your core product, incentives and users, you can begin to lay out your data model. From there, you can define your message types and operations.

## Common Strategies and Conventions

### Address Space

Because there are many different formats for addresses across the different supported blockchains, a compatibility format is necessary. Wormhole uses its own address format (generally referred to as Wormhole format) in order to solve this issue. These addresses correspond 1 to 1 with native addresses on each chain.

A Wormhole address is a tuple containing the 2 byte Wormhole chain ID and a 32 byte shim address, totalling 34 bytes.

Because EVM addresses are only 20 bytes in length, to convert this to a Wormhole address, the address is left-padded with zeros until it's length 32. To transmit as this as a single item, the Wormhole chain ID is usually appended to the front, resulting in a 34 byte address.

When dealing with addresses inside your messages, it's recommended to always convert to Wormhole format and transmit in that format. You will regularly encounter addresses in the Wormhole format when interacting with other parts of the ecosystem, and adopting the format in your protocol will enhance your forward compatibility as you add more chains.

### Trusted Contract Network

Typically, the first check performed when receiving a message is to validate that it originates from a trusted source. If your protocol has smart contracts deployed to multiple chains, it will be important for your contracts to know which other contracts are 'in network' for your protocol. 

Generally, this list of trusted contracts is stored in the state of each contract individually. Updating the trusted contracts is tied into the governance mechanism of the protocol.

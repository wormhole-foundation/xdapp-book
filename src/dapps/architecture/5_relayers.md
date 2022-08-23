# Relayers

In Chapter 2, we discussed the [general concepts associated with relayers in the Wormhole ecosystem](../../wormhole/6_relayers.md). In this section, we'll elaborate on what considerations need to be taken into account when using relayers for your xDapp.

## Fundamentals

The most important thing to remember about relayers is that they are _untrusted_. This means you don't have to trust them, but it also means you can't trust them. This is true of both generic and specialized relayers.

Let's dive into a little more detail about _why_ relayers are untrusted, and what this means for you when designing a protocol.

A few key properties of VAAs are that they:

- are publicly emitted from the Guardian Network

- need to be signed by the Guardian Network to be considered authentic

- can be verified as authentic by _any_ Wormhole Core Contract they are brought to _by anyone_.

Relayers are untrusted as an inherent consequence of these properties. Anyone can pick up a VAA and deliver it anywhere they feel like, however, no one can alter the content of the VAA without invalidating the signatures.

So, when writing your contracts, it's incredibly important to only trust information which is either **inside your contract** or **inside a VAA**. If you trust information provided by a relayer, you are opening yourself up to untrusted input attacks.

The easiest and most secure way to interact with relayers then is to _only accept the VAA as input_. If the relayer can't provide any additional args, then there's no way for them to provide untrusted input.

There are more advanced strategies whereby the relayer performs **untrusted** off-chain computation which is passed into the destination contract. These strategies can optimize gas costs, but must be used carefully, as they can create attack vectors if not used correctly.

With this in mind, relayer design is mostly a matter of structuring the messages in your protocol in a manner such that there is a single, deterministic way that they can be processed. In a well designed protocol, relayers have a 'correct' implementation.

Relayers are conceptually quite similar to "crank turner" processes used elsewhere in blockchain, in that there is only a single action which can be taken (pulling the crank), and their sole responsibility is to initiate this action and pay for the costs.

---

## Generic Relayers

Generic Relayers are a decentralized relayer network which can deliver arbitrary VAAs, so long as the recipient contract is conformant with the generic relayer API.

### Advantages:

- Purely done on-chain. No need to develop, host, or maintain relayers

### Disadvantages:

- Less room for optimization via features like conditional delivery, batching, off-chain calculations, etc.

---

## Specialized Relayers

Specialized Relayers are relayers which are purpose-built to relay messages for a certain application.

### Advantages:

- Can perform off-chain untrusted computation
- Highly customizeable. Can perform batching, conditional delivery, multi-chain deliveries, etc.
- Can home-roll an incentive structure

### Disadvantages

- Requires development work, and requires relayer hosting

In the future, there may be ways to customize generic relayers such that they will gain the advantages of today's specialized relayers.

### Relayer Incentives

Relayers have to cover the costs of executing the downstream transactions resulting from the original 'source' transaction. Unless the relayers are running at a loss, there must be a mechanism for reimbursing the relayer in exchange for message delivery.

There are tons of strategies here, and the 'best' strategy for an application is often dependent on the specifics of that application. However, a few of the most common strategies are:

- pay the relayer with a potion of the tokens being sent cross-chain
- collect a safe amount of gas money from the end user prior to performing any actions
- 'lazy' relaying, where relaying might only become profitable in certain, potentially rare, market conditions

Generic relayers have an incentive model built in to the network, so you do not need to design an incentive structure when using them.

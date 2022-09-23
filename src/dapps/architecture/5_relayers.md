# Relayers

In Chapter 2, we discussed the [general concepts associated with relayers in the Wormhole ecosystem](../../wormhole/6_relayers.md). In this section, we'll elaborate on the considerations that should be accounted for when using relayers in your xDapp.

## Fundamentals

It's important to remember that relayers are untrusted. This means you don't have to trust them--but it also means you can't trust them. This is true of both generic and specialized relayers.

Let's dive into a little more detail about why relayers are untrusted and what this means for you.

A few key properties of VAAs:

- They are publicly emitted from the Guardian Network.
- They need to be signed by the Guardian Network to be considered authentic.
- They can be verified as authentic by anyone and any Wormhole Core Contract.

Relayers are untrusted as an inherent consequence of these properties. Anyone can pick up a VAA and deliver it anywhere, but no one can alter the content of the VAA without invalidating the signatures.

So, when writing your contracts, it's incredibly important to only trust information which is either inside your contract or inside a VAA. If you trust information provided by a relayer, you are opening yourself up to untrusted input attacks.

The easiest and most secure way to interact with relayers then is to only accept the VAA as input. If the relayer can't provide any additional args, then there's no way for them to provide untrusted input.

More advanced strategies involve having the relayer perform untrusted off-chain computation which is passed into the destination contract. These strategies can optimize gas costs, but can also create attack vectors if not used correctly.

With this in mind, relayer design becomes a matter of structuring the messages in your protocol such that there is a single, deterministic way that they can be processed. In a well designed protocol, relayers have a 'correct' implementation.

Relayers are conceptually quite similar to "crank turner" processes used elsewhere in blockchain, in that there is only a single action which can be taken (pulling the crank), and their sole responsibility is to initiate this action and pay for the costs.

---

## Generic Relayers

Generic relayers are a decentralized relayer network which can deliver arbitrary VAAs as long as the recipient contract conforms with the generic relayer API.

**_Advantages:_**

- Generic relayers are done purely on-chain, so there's no need to develop, host or maintain relayers.

**_Disadvantages:_**

- There's less room for optimization via features like conditional delivery, batching, off-chain calculations, etc.

---

## Specialized Relayers

Specialized Relayers are relayers that are purpose-built to relay messages for a certain application. In the future, there may be ways to customize generic relayers such that they will gain the advantages of today's specialized relayers.

**_Advantages:_**

- Specialized relayers can perform off-chain untrusted computation.
- They are highly customizeable and can perform batching, conditional delivery, multi-chain deliveries, etc.
- Can home-roll an incentive structure.

**_Disadvantages_**

- Requires development work and relayer hosting.

---

### Relayer Incentives

Relayers have to cover the costs of executing the downstream transactions resulting from the original 'source' transaction. Unless the relayers are running at a loss, there must be a mechanism for reimbursing the relayer in exchange for message delivery.

There are many strategies for reimbursement, and the 'best' strategy for an application is often dependent on the specifics of that application. However, a few of the most common strategies are:

- Pay the relayer with a potion of the tokens being sent cross-chain.
- Collect a safe amount of gas money from the end user prior to performing any actions.
- 'Lazy' relaying, where relaying might only be profitable in certain, potentially rare, market conditions.

Generic relayers have an incentive model built in to the network, so you do not need to design an incentive structure when using them.

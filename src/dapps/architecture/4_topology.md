# Topology

Topology describes how data flows through your application and defines the responsibilities of each component. In terms of overall xDapp topology, the primary decision is determining where your smart contracts will live and the responsibilities each contract will hold.

## Ultra-light Clients

![Ultra-light client](../../diagrams/images/ultralight.png "Ultra Light Clients")

Ultra-light clients are often the best option when designing an MVP for your xDapp. The defining feature of an ultra-light client is the ability to support users from every chain in the Wormhole ecosystem while only having smart contracts on a single chain.

This works by deploying a single _hub_ contract (or just using an existing Dapp) onto the hub chain. From there, add an entrypoint which supports _contract controlled transfers_ from the xAsset contracts on the hub chain. This allows your hub contract to receive tokens--and instructions for what to do with them--from other chains in the Wormhole ecosystem.

Once that's done, the hub contract performs any necessary operations and bridges any resultant tokens back to the wallet which initiated the transfer. The only on-chain components are the hub contract and a lightweight wrapper that allows the hub contract to send and receive tokens using the xAsset contracts. All other elements of this topology are off-chain and untrusted. This pushes most of the development work out of smart contracts and into client-side typescript, dramatically decreasing smart contract risk without altering the trust assumptions of your application.

**_Advantages:_**

- Risk: Very little added smart contract risk.
- Ease: Simple to develop.
- Community: Easiest way to get heterogenous ecosystem support.

**_Disadvantages:_**

- Latency: Because all transactions have to bridge in and out of the hub chain, each transaction incurs the finality latency of both the remote and hub chain.
- Transaction fees: There are always a grand total of three transactions. Two on the remote chain, and one on the hub chain.
- Use cases: There is no place to perform trusted computation on the remote chain, so some use cases are more difficult to implement (or potentially not possible).

## Hub-and-Spoke

Hub-and-spoke models are a natural evolution of the ultra-light client. A hub contract still handles all transactions, but there is now also a contract deployed to all the remote chains.

**_Advantages:_**

- Risk: Remote contracts are lightweight and don't carry large amounts of risk.
- Flexibility: Can perform trusted checks on the remote chain (such as validating wallet balance, or any other piece of blockchain state).

**_Disadvantages:_**

- Latency: Same as ultra-light clients, where each transaction incurs the finality latency of both the remote and hub chain.
- Transaction fees: There are always a grand total of three transactions, in the same fashion as ultra-light clients. 
- Complexity: Requires managing multiple contracts.

## Mesh

A mesh topology is one where each chain implements the full logic for a process, such that each contract is a peer of other contracts in the trusted network and can act autonomously.

**_Advantages:_**

- Latency: Users can often perform their operation without waiting for other chains.
- Transaction Fees: Does not stack the transaction fees of multiple chains.

**_Disadvantages:_**

- Complexity: There are now quite a few contracts to manage, especially if they are implemented multiple times across different VMs.
- Data desync: Because each blockchain acts independently, each chain will have independent state. This can open up unwanted arbitrage opportunities and other discrepancies.
- Race conditions: In cases where an event is supposed to propagate through the entire system at a fixed time (for example, when closing a governance vote), it can be difficult to synchronize all the blockchains.

## Distributed

A distributed topology is one where different blockchains have different responsibilities.

**_Advantages:_**

- Power: Utilizes each blockchain for their individual strengths.

**_Disadvantages:_**

- Complexity: Requires multiple specialized smart contracts and additional on-chain processes.

## Mix & Match

Different use cases have different optimal topologies, and it's possible to use different topologies for different workflows. You should not feel 'locked in' to a single topology, so consider designing each workflow independently. For example, governance workflows are generally best implemented using a hub-and-spoke topology, even if the rest of the application uses a mesh architecture. As such, your contracts will likely evolve as your xDapp evolves.

You can also progress through different topologies. A common strategy is to start off with an ultra-light client, move to a hub and spoke configuration, and then add optimizations and specialties to contracts as the need arises.

# What is Wormhole?

Wormhole is a generic message passing protocol that connects to multiple chains including Ethereum, Solana, Terra, Binance Smart Chain, Polygon, Avalanche, Oasis, and Fantom.
Wormhole does this through emitting messages from one chain which are observed by a Guardian network of nodes and verified. After verification, this message is submitted to the target chain for processing.
This simple message passing primitive enables cross chain functionality. Users interact with xDapps (cross chain decentralized applications) to transfer xAssets (cross chain assets) between networks or access their xData (cross chain data) to provide them services on their current network.
On top of the Wormhole message protocol, there’s two specific applications that help concentrate liquidity for xAssets. The Portal Token Bridge and Portal NFT Bridge provide a standard message format for token and NFT transfers across the Wormhole bridge.

## What can Wormhole be used for?
Wormhole can be used by developers to build xDapps, a new type of chain agnostic application that can take advantage of xAssets and xData. This allows for access to increased liquidity, communities, and user identity.

Some prominent examples of xDapps:

- Cross chain exchange:

    Using Portal, the Token Bridge built on Wormhole, a developer can build an exchange that allows deposits from any Wormhole connected chain, massively increasing the liquidity their users can interact with. A user could directly deposit LUNA from Terra into an app running on Solana! All the developer has to do is integrate Wormhole SDK into their frontend and that deposit will get picked up by the Portal Token Bridge, and taken over to target chain.

- Cross chain governance app:

    Consider all the NFT collections on various networks. If a group of these collections on different networks wanted their holders to vote on a combined proposal, they could pick a “Voting” chain, and use Wormhole to shuttle all the votes from cast on their various chains to the voting chain.

- Cross chain game: 

    A game could be built and played on a performant network like Solana, and it’s rewards issued as NFTs on a different network, for example Ethereum.

## How does Wormhole work?
Wormhole has a Core Bridge contract deployed on all the connected networks. Wormhole Guardians run a full node for each of the connected chains, specifically listening to any events from the Core Contracts. The core contracts emit a message, which is picked up by the Guardians. The Guardians verify the message and sign it, creating a VAA (Verified Action Approval). This VAA then sits on the Guardians network where it can be retrieved by the user or by a relayer to be submitted to the target chain to process the message. Unlike other bridges, a relayer in Wormhole has no special privileges, it’s just a piece of software that shuttles messages between the Guardian network to the target chain, and is not a trusted entity.
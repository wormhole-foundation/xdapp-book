# xMint Client

Let's walk through a few of the elements of the xMint client you'll see in the project folder:

## [Orchestrator.ts](https://github.com/wormhole-foundation/xdapp-book/blob/main/projects/xmint/orchestrator.ts)
A Typsecript client that provides a chain agnostic way to deploy and call the functions of xMint contracts by utilizing EVM.ts and Solana.ts.

## [EVM.ts](https://github.com/wormhole-foundation/xdapp-book/blob/main/projects/xmint/handlers/evm.ts)
A Typsecript client that deploys and calls the functions of the EVM contracts.

## [Solana.ts](https://github.com/wormhole-foundation/xdapp-book/blob/main/projects/xmint/handlers/solana.ts)
A Typescript client that deploys and calls the functions of the Solana contracts.

## Deploy
Compiles and deploys the contracts using the chain appropriate tools. The deployed addresses are stored to be used later.

For EVM, this is done using [forge](https://getfoundry.sh) and for Solana, this is done using [Anchor](https://www.anchor-lang.com/).

## Register App
Initiate a two step process of: 
1. Register deployed contract address from target chain onto source chain 
    - no Wormhole interaction is necessary for this step
2. Attest deployed token address from target chain onto source chain 
    - Wormhole token attestation interaction is necessary for this step

## Buy Token
Initiates a three step process of: 
1. Create a buy VAA on source chain
    - Emits a Contract Controlled Payload that contains (1) the amount of tokens the user wants to pay and (2) the user's wallet address.
    <!-- - On Ethereum, this maps to `transferFromEthNative()`. On Solana, this maps to `transferFromSolana()`. -->
2. Submit buy VAA on target chain and generate a VAA to claim tokens
    - Verifies the buy VAA generated in the previous step, mints the appropriate amount of target chain tokens, and generates a Token Transfer VAA that sends the minted amount of tokens to the user's wallet on source chain.  
    <!-- - On Ethereum, this maps to `submitForeignPurchase()`. On Solana,  -->
3. Claim tokens on source chain
    - Verifies the Token Transfer VAA generated in the previous step to claim a wrapped version of the token on the source chain.


## Sell Token
Initiates a three-step process of:
1. Create a sell VAA on source chain
2. Submit sell VAA on target chain and generate a VAA to claim tokens
3. Claim tokens on source chain

## Balance
Returns the balance of a token by chain in question and chain token originated from. 
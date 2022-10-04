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
Takes the deployed contract address from the target chain and registers it on the source chain. No Wormhole interaction is necessary for this step.

Takes the deployed token address from the target chain and attests it on the source chain. A Wormhole token attestation interaction is necessary for this step.


## Buy Token



## Sell Token



## Balance
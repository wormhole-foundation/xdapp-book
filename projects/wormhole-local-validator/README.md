# Wormhole Local Validator

This repository contains a set of scripts to get started using Wormhole. It contains the wormhole local validator, along with code to spin up EVM and Solana local validators, and deployment code to add Wormhole contracts to those new chains.

## Dependencies
You will also need Docker; you can get either [Docker Desktop](https://docs.docker.com/get-docker/) if you're developing on your computer or if you're in a headless vm, install [Docker Engine](https://docs.docker.com/engine/). Make sure to have Docker running before you run any of the following commands.

To run EVM chains you will need [Ganache](https://github.com/trufflesuite/ganache#command-line-use).  
To run Solana chains you will need [Solana](https://docs.solana.com/cli/install-solana-cli-tools) installed. 

## Run EVM Chains
`npm run evm` will start up two EVM chains with Wormhole Chain ID 2 (like ETH) and Wormhole Chain ID 4 (like BSC) and deploy the Wormhole Core Bridge (`0xC89Ce4735882C9F0f0FE26686c53074E09B0D550`), Token Bridge (`0x0290FB167208Af455bB137780163b7B7a9a10C16`), and NFT Bridge (`0x26b4afb60d6c903165150c6f0aa14f8016be4aec`) contracts to them. They'll also deploy a Test Token (TKN at `0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A`), test NFT (`0x5b9b42d6e4B2e4Bf8d42Eba32D46918e10899B66`), and WETH Contract (`0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E`)

They'll use the standard Wormhole test mnemonic (`myth like bonus scare over problem client lizard pioneer submit female collect`) and use the first key for deployment and payment (Public Key: `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`, Private Key: (`0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`)) 

## Run Solana Chain
`npm run solana` will start up a Solana chain and load in Core Bridge (`Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o`) and Token Bridge (`B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE`) accounts.  

## Run Wormhole
After you have the dependencies installed and the chains running, you can run Womrhole.

Simply run `npm run wormhole` and wait while the Wormhole Guardian builds a docker image. The first time you run this command, it might take a while (up to 550 seconds on a modern laptop!). After the image is built however, it'll be relatively fast to bring it up and down. 

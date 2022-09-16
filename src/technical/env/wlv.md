# Wormhole Local Validator 

- wormhole local validator is a development build of the guardian software
- easy to run, easy to configure. Connect it to whatever blockchain you feel like using, and use some provided scripts to deploy the necessary wormhole contracts
- Newer, still has features being added

## What is Wormhole Local Validator (WLV)?

[Wormhole Local Validator](https://github.com/wormhole-foundation/xdapp-book/tree/main/projects/wormhole-local-validator) is a development build of the Guardian software and designed to be the simplest custom environment - there is a single Guardian running on docker and otherwise a BYOB (Bring Your Own Blockchain) setup.

## Is WLV Right for You?

Here's a succinct list of the pros and cons of the environment, so you can decide if it's the right fit for you.

- Pros
    - Lightweight, low system resource demand
    - Good iteration times
    - Can be added into an existing blockchain development setup

- Cons
    - You may end up reinventing the tilt/testnet environment as you add more components

## Setting up Wormhole Local Validator

You will **need** Docker running in order to set up WLV. If you're developing on your computer, you should get [Docker Desktop](https://docs.docker.com/get-docker/); if you're in a headless VM, you should install [Docker Engine](https://docs.docker.com/engine/). 

To simulate the blockchains that are of interest, you are required to install the software for the validator nodes locally on your comupter or somewhere else to run them. Code to spin up EVM and Solana local validators, as well as scripts to deploy the necessary Wormhole contracts to these local instances, are provided in the repo.

---

Below are instructions to set up a local EVM and Solana environment:

**EVM Chains**

`npm run evm` will set up:
- (2) EVM chains
    - Wormhole Chain ID 2 (like ETH)
    - Wormhole Chain ID 4 (like BSC)
- (3) Wormhole contracts
    - Core Bridge at `0xC89Ce4735882C9F0f0FE26686c53074E09B0D550`
    - Token Bridge at `0x0290FB167208Af455bB137780163b7B7a9a10C16`
    - NFT Bridge at `0x26b4afb60d6c903165150c6f0aa14f8016be4aec` 
- (3) utility contracts
    - Test Token (TKN) at `0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A`
    - test NFT at `0x5b9b42d6e4B2e4Bf8d42Eba32D46918e10899B66`
    - WETH Contract at `0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E`

These contracts will use the standard Wormhole test mnemoic (`myth like bonus scare over problem client lizard pioneer submit female collect`) and use the first key for deployment and payment (Public Key: `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1`, Private Key: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`)

**Solana Chains**

`npm run solana` will set up:
- (1) Solana chain
- (2) Wormhole contracts
    - Core bridge at `Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o`
    - Token bridge at `B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE`

---

Once you have the dependencies for each blockchain installed and have the chains running, you can run Wormhole.

`npm run wormhole` will pull and run the Wormhole Guardian docker image.

The initial setup for Wormhole Local Validator can take upwards of 500 seconds but after the image is built, bringing it up and down usually takes less than 60 seconds.

## FAQ & Common Questions

- Q: Anvil isn't working
    - While we recommend Foundry's Forge tool for compiling and deploying code elsewhere in these docs, we do not at this time recommend using anvil for guardiand; this is because guardiand is spec'd against go-ethereum, and anvil is out of spec for how it reports block headers (non left padding to normalize length), which means go-ethereum reacts abnormally and can't read anvil headers.
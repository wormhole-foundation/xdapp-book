# EVM Messenger
Simple messenger project that sends a "Hello World" message between two EVM chains using Wormhole. 

## Dependencies
This project uses Foundry to compile and deploy EVM contracts. You can find install instructions at [`https://getfoundry.sh`](http://getfoundry.sh)

The javascript dependencies can be installed via `npm install` in this folder.

You will also need Docker; you can get either [Docker Desktop](https://docs.docker.com/get-docker/) if you're developing on your computer or if you're in a headless vm, install [Docker Engine](https://docs.docker.com/engine/)

## Run Guardiand
After you have the dependencies installed, we'll need to spin up the EVM chains, deploy the Wormhole contracts to them, then startup a Wormhole Guardian to observe and sign VAAs. We have provided a script to automate this all for you.

Simply run `npm run guardiand` and wait while the Wormhole Guardian builds a docker image. The first time you run this command, it might take a while (up to 550 seconds on a modern laptop!). After the image is built however, it'll be relatively fast to bring it up and down. 

## Test Scripts
After you have Guardiand running, you can run the basic test with `npm run test`. This will: 
- Deploy a Treasury contract
- Attest the TKN ERC20 token from Chain0 (ETH) to Chain1 (BSC)
- Mint 100 TKN tokens to the Treasury on ETH
- Approve & Transfer 50 TKN tokens from the treasury on ETH to the Treasury on BSC.


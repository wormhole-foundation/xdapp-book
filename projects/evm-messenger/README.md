# EVM Messenger
Simple messenger project that sends a "Hello World" message between two EVM chains using Wormhole. 

## Dependencies
This project uses Foundry to compile and deploy EVM contracts. You can find install instructions at [`https://getfoundry.sh`](http://getfoundry.sh)

The javascript dependencies can be installed via `npm install` in this folder.

## Test Scripts
After you have Guardiand running, you can run the basic test with `npm run test`. This will: 
- Deploy a simple Messenger contract (found in chains/evm/src/Messenger.sol) to each EVM chain
- Register each contract with the other chain
- Send a message from each contract
- Fetch the VAA from the Guardian
- Submit the VAA to each contract
- Print out the Message

If everything goes correctly, you should get a printout with the Hello World messages on each chain.
# EVM Messenger

## Orchestrator.js
A JS client that deploys and calls the functions of the two Messenger contracts on two chains.

## Deploy
Uses [forge](https://getfoundry.sh) to compile and deploy the code. Stores the deployed address to be used later.

## Register Chain
Takes the deployed address from the target chain and registers it on the source chain. No Wormhole interaction is necessary for this step.

## Send Msg
Calls the `sendMsg()` function on the source chain, which emits a VAA. Fetches the VAA from the Wormhole Guardian and stores it.

## Submit VAA
Manually relays the VAA to the target chain.

## Get Current Msg
Returns the chain's current message.

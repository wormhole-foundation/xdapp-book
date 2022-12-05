## Wormhole Messenger Sample Project
Simple messeger project that sends a "hellom, world!" message between EVM, Solana and Aptos chains using Wormhole. 

### Dependencies
This project uses Foundry to compile and deploy EVM contracts. You can find install instructions at [https://getfoundry.sh](https://getfoundry.sh)

<br><br>

The javascript dependencies can be installed via npm install in this folder.

### Test Scripts
After you have Guardiand running (you can use the wormhole-local-validator, you can run the basic test with npm run test. This will:

* Deploy a simple Messenger contract (found in chains/evm/src/Messenger.sol) to each EVM chain
* Register each contract with the other chain
* Send a message from each contract
* Fetch the VAA from the Guardian
* Submit the VAA to each contract
* Print out the Message
* If everything goes correctly, you should get a printout with the Hello World messages on each chain.

### Common Errors

#### Nonce issues
If you see transactions failing due to nonce mismatch errors, restart your local evm chain. If using the [wormhole-local-validator](wormhole-local-validator), just rerun npm run evm and then retry npm run test.

This is intermittent and likely caused by the js lib and evm chain being out of sync.

#### Transaction Underpriced Issues
Transactions failing with the message `transaction underpriced` is an intermittent issue. Restart the evm chains and rerun `npm run test`. If the issue persists, you may need to manually set gas prices when calling the Messenger contract in the `send_msg` logic in `orchestrator.js`.

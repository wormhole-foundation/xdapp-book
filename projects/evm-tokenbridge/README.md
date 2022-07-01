# EVM Token Bridge
Attests and send tokens from one EVM contract to another on another EVM chain.


## Dependencies
This project uses Foundry to compile and deploy EVM contracts. You can find install instructions at [`https://getfoundry.sh`](http://getfoundry.sh)

The javascript dependencies can be installed via `npm install` in this folder.

## Test Scripts
You can run the basic test with `npm run test`. This will: 
- Deploy a Treasury contract
- Attest the TKN ERC20 token from Chain0 (ETH) to Chain1 (BSC)
- Mint 100 TKN tokens to the Treasury on ETH
- Approve & Transfer 50 TKN tokens from the treasury on ETH to the Treasury on BSC.


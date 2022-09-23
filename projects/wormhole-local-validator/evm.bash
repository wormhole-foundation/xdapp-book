#!/usr/bin/env bash

set -euo pipefail

# Start EVM Chain 0
npx pm2 delete evm0 2> /dev/null || true
npx pm2 start 'npx ganache --chain.chainId 1 -p 8545 -m "myth like bonus scare over problem client lizard pioneer submit female collect" --block-time 1' --name evm0

# Start EVM Chain 1
npx pm2 delete evm1 2> /dev/null || true
npx pm2 start 'npx ganache --chain.chainId 1397 -p 8546 -m "myth like bonus scare over problem client lizard pioneer submit female collect" --block-time 1' --name evm1

cd wormhole/ethereum

#Install Wormhole Eth Dependencies
make .env build

# Deploy Wormhole Contracts to EVM Chain 0
npm run migrate && npx truffle exec scripts/deploy_test_token.js && npx truffle exec scripts/register_solana_chain.js && npx truffle exec scripts/register_terra_chain.js && npx truffle exec scripts/register_eth_chain.js && npx truffle exec scripts/register_bsc_chain.js

# Deploy Wormhole Contracts to EVM Chain 1
perl -pi -e 's/CHAIN_ID=0x2/CHAIN_ID=0x4/g;s/EVM_CHAIN_ID=1/EVM_CHAIN_ID=1397/g' .env && perl -pi -e 's/8545/8546/g' truffle-config.js 
npm run migrate && npx truffle exec scripts/deploy_test_token.js && npx truffle exec scripts/register_solana_chain.js && npx truffle exec scripts/register_terra_chain.js && npx truffle exec scripts/register_eth_chain.js && npx truffle exec scripts/register_bsc_chain.js
perl -pi -e 's/CHAIN_ID=0x4/CHAIN_ID=0x2/g;s/EVM_CHAIN_ID=1397/EVM_CHAIN_ID=1/g' .env && perl -pi -e 's/8546/8545/g' truffle-config.js

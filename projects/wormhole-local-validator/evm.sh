#!/usr/bin/env bash

# Start EVM Chain 0
npx pm2 stop evm0
npx pm2 start 'npx ganache -p 8545 -m "myth like bonus scare over problem client lizard pioneer submit female collect" --block-time 1' --name evm0

# Start EVM Chain 1
npx pm2 stop evm1
npx pm2 start 'npx ganache -p 8546 -m "myth like bonus scare over problem client lizard pioneer submit female collect" --block-time 1' --name evm1

#Install Wormhole Eth Dependencies
cd wormhole/ethereum
npm i
cp .env.test .env
npm run build

# Deploy Wormhole Contracts to EVM Chain 0
npm run migrate && npx truffle exec scripts/deploy_test_token.js && npx truffle exec scripts/register_solana_chain.js && npx truffle exec scripts/register_terra_chain.js && npx truffle exec scripts/register_eth_chain.js && npx truffle exec scripts/register_algo_chain.js && nc -lkp 2000 0.0.0.0

# Deploy Wormhole Contracts to EVM Chain 1
perl -pi -e 's/CHAIN_ID=0x2/CHAIN_ID=0x4/g' .env && perl -pi -e 's/8545/8546/g' truffle-config.js 
npm run migrate && npx truffle exec scripts/deploy_test_token.js && npx truffle exec scripts/register_solana_chain.js && npx truffle exec scripts/register_terra_chain.js && npx truffle exec scripts/register_eth_chain.js && npx truffle exec scripts/register_algo_chain.js && nc -lkp 2000 0.0.0.0
perl -pi -e 's/CHAIN_ID=0x4/CHAIN_ID=0x2/g' .env && perl -pi -e 's/8546/8545/g' truffle-config.js

#!/usr/bin/env bash

# Start EVM Chain 0
npx pm2 kill -n evm0
npx pm2 start 'ganache -p 8545 -m "myth like bonus scare over problem client lizard pioneer submit female collect" --block-time 1' --name evm0

#Install Wormhole Eth Dependencies
cd wormhole/ethereum
npm i
cp .env.test .env
npm run build

# Deploy Wormhole Contracts to EVM Chain 0
npm run migrate && npx truffle exec scripts/deploy_test_token.js && npx truffle exec scripts/register_solana_chain.js && npx truffle exec scripts/register_terra_chain.js && npx truffle exec scripts/register_bsc_chain.js && npx truffle exec scripts/register_algo_chain.js
#!/usr/bin/env bash

set -euo pipefail

# Start EVM Chain 0
npx pm2 delete aptos 2> /dev/null || true
npx pm2 start 'aptos node run-local-testnet --with-faucet --force-restart --assume-yes' --name aptos
sleep 15
cd wormhole/aptos/scripts && bash deploy devnet && cd ../../../


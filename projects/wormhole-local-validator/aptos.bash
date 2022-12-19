 #!/usr/bin/env bash

set -euo pipefail

# (TODO: Change after figuring out how to run const-gen without tilt)
cp ./aptos/.env ./wormhole/aptos/

# Start Aptos Chain
npx pm2 delete aptos 2> /dev/null || true
npx pm2 start 'aptos node run-local-testnet --with-faucet --force-restart --assume-yes' --name aptos
sleep 15
cd wormhole/aptos/scripts && bash deploy devnet && worm aptos faucet && bash register_devnet && cd ../../../
#!/usr/bin/env bash

set -euo pipefail

# Dependencies
cargo install spl-token-cli

# Start Solana
npx pm2 stop solana 2> /dev/null || true
npx pm2 start "solana-test-validator" --name solana -- -r

# Set Solana Config to Localhost
solana config set -u localhost -k wormhole/solana/keys/solana-devnet.json

# Constants
cli_address=6sbzC1eH4FTujJXWj51eQe25cYvr4xfXbJ1vAj7j2k5J
bridge_address=Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o
nft_bridge_address=NFTWqJR8YnRVqPDvTJrYuLrQDitTG5AScqbeghi4zSA
token_bridge_address=B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE
recipient_address=90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
chain_id_ethereum=2

# Fund the account
solana airdrop 1000

# Create a new SPL token
token=$(spl-token create-token -- solana-keys/token.json | grep 'Creating token' | awk '{ print $3 }')
echo "Created token $token"

# Create token account
account=$(spl-token create-account "$token" | grep 'Creating account' | awk '{ print $3 }')
echo "Created token account $account"

# Mint new tokens owned by our CLI account
spl-token mint "$token" 10000000000 "$account"

# Create meta for token
token-bridge-client create-meta "$token" "Solana Test Token" "SOLT" ""

# Create a new SPL NFT
nft=$(spl-token create-token --decimals 0 -- solana-keys/nft.json | grep 'Creating token' | awk '{ print $3 }')
echo "Created NFT $nft"

# Create NFT account
nft_account=$(spl-token create-account "$nft" | grep 'Creating account' | awk '{ print $3 }')
echo "Created NFT account $nft_account"

# Mint new NFT owned by our CLI account
spl-token mint "$nft" 1 "$nft_account"

# Create meta for token
token-bridge-client create-meta "$nft" "Not a PUNK🎸" "PUNK🎸" "https://wrappedpunks.com:3000/api/punks/metadata/39"

nft=$(spl-token create-token --decimals 0 -- nft2.json | grep 'Creating token' | awk '{ print $3 }')
echo "Created NFT $nft"

nft_account=$(spl-token create-account "$nft" | grep 'Creating account' | awk '{ print $3 }')
echo "Created NFT account $nft_account"

spl-token mint "$nft" 1 "$nft_account"

token-bridge-client create-meta "$nft" "Not a PUNK 2🎸" "PUNK2🎸" "https://wrappedpunks.com:3000/api/punks/metadata/51"


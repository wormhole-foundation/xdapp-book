#!/usr/bin/env bash

# Start Solana
npx pm2 kill -n solana

npx pm2 start "solana-test-validator" --name solana -- -r \
                --bpf-program Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o ./solana-accounts/core/core_bridge.so \
                --account FKoMTctsC7vJbEqyRiiPskPnuQx2tX1kurmvWByq5uZP ./solana-accounts/core/bridge_config.json \
                --account GXBsgBD3LDn3vkRZF6TfY5RqgajVZ4W5bMAdiAaaUARs ./solana-accounts/core/fee_collector.json \
                --account 6MxkvoEwgB9EqQRLNhvYaPGhfcLtBtpBqdQugr3AZUgD ./solana-accounts/core/guardian_set.json  \
                --bpf-program B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE ./solana-accounts/token/token_bridge.so \
                --account 3GwVs8GSLdo4RUsoXTkGQhojauQ1sXcDNjm7LSDicw19 ./solana-accounts/token/token_config.json
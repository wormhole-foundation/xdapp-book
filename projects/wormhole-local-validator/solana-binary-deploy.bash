#!/usr/bin/env bash

set -euo pipefail

# Start Solana
npx pm2 delete solana 2> /dev/null || true

### Uses prebuilt binaries to boot up STV. Leave the solana-accounts folder in there for those that want to use it with Anchor Validator
npx pm2 start "solana-test-validator" --name solana -- -r \
                --bpf-program Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o ./solana-accounts/core/core_bridge.so \
                --account FKoMTctsC7vJbEqyRiiPskPnuQx2tX1kurmvWByq5uZP ./solana-accounts/core/bridge_config.json \
                --account GXBsgBD3LDn3vkRZF6TfY5RqgajVZ4W5bMAdiAaaUARs ./solana-accounts/core/fee_collector.json \
                --account 6MxkvoEwgB9EqQRLNhvYaPGhfcLtBtpBqdQugr3AZUgD ./solana-accounts/core/guardian_set.json  \
                --bpf-program B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE ./solana-accounts/token/token_bridge.so \
                --account 3GwVs8GSLdo4RUsoXTkGQhojauQ1sXcDNjm7LSDicw19 ./solana-accounts/token/token_config.json \
                --account 7UqWgfVW1TrjrqauMfDoNMcw8kEStSsQXWNoT2BbhDS5 ./solana-accounts/token/emitter_eth.json \
                --account BmRvjCA2cQ1qUNAMVAnPgmjATSBPa2pxE3Q7bRoSGFED ./solana-accounts/token/emitter_bsc.json \
                --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s ./solana-accounts/thirdparty/mpl_token_metadata.so
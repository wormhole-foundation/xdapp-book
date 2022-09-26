set -e pipefail

# Rerun solana validator
cd ../wormhole-local-validator && npm run evm && npm run solana && npm run wormhole && cd ../xmint

# Deploy the code on EVM0 and SOL0
ts-node orchestrator.ts deploy evm0 
ts-node orchestrator.ts deploy sol0

# Register Apps EVM<>SOL
ts-node orchestrator.ts register-app evm0 sol0
ts-node orchestrator.ts register-app sol0 evm0

# Print Balances for EVM0 and SOL0 Keypairs
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 sol0 
ts-node orchestrator.ts balance sol0 sol0
ts-node orchestrator.ts balance sol0 evm0

# Buy SOL0-TOKEN with eth 
#ts-node orchestrator.ts buy-token evm0 sol0 100

# Buy EVM0-TOKEN with SOL 
ts-node orchestrator.ts buy-token sol0 evm0 100

# Print Balances for EVM0 and SOL0 Keypairs
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 sol0 
ts-node orchestrator.ts balance sol0 sol0
ts-node orchestrator.ts balance sol0 evm0
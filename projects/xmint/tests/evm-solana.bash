# Build SOL code 
cd chains/solana && anchor build && cd ../../
cd chains/evm && forge install --no-git --no-commit && cd ../../

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
ts-node orchestrator.ts buy-token evm0 sol0 100
# Print SOL0 Balance
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 sol0

# Buy EVM0-TOKEN with sol
ts-node orchestrator.ts buy-token sol0 evm0 100
# Print SOL0 Balance for Solana and EVM0-TOKENS
ts-node orchestrator.ts balance sol0 sol0
ts-node orchesatrator.ts balance sol0 evm0

# Sell SOL0-TOKEN for eth
ts-node orchestrator.ts sell-token sol0 evm0 100
# Print SOL0 Balance for solana and EVM0-TOKENS
ts-node orchestrator.ts balance sol0 sol0
ts-node orchestrator.ts balance sol0 evm0

# Sell EVM0-TOKEN for solana
ts-node orchestrator.ts sell-token evm0 sol0 100
# Print EVM0 Balance for eth and SOL0-TOKENS
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 sol0

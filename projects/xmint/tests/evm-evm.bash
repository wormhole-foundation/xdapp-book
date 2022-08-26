# Install Deps
cd chains/evm && forge install --no-git --no-commit && cd ../../

# Deploy the code
ts-node orchestrator.ts deploy evm0 
ts-node orchestrator.ts deploy evm1

# Register Apps
ts-node orchestrator.ts register-app evm0 evm1
ts-node orchestrator.ts register-app evm1 evm0

# Print Balances 
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 evm1 
ts-node orchestrator.ts balance evm1 evm1
ts-node orchestrator.ts balance evm1 evm0

# Buy Tokens
ts-node orchestrator.ts buy-token evm0 evm1 100

# Print Balance
ts-node orchestrator.ts balance evm0 evm0
ts-node orchestrator.ts balance evm0 evm1

# Install Deps
yarn

# Deploy evm0 and aptos
ts-node orchestrator.ts deploy evm0
ts-node orchestrator.ts deploy aptos

# Register evm0 on aptos and vice versa
ts-node orchestrator.ts register-network evm0 aptos
ts-node orchestrator.ts register-network aptos evm0

# Emit VAA from evm0
ts-node orchestrator.ts emit-msg evm0 "Hello from evm0"
# Emit VAA from aptos
ts-node orchestrator.ts emit-msg aptos "Hello from aptos"

# Submit evm0 VAA to aptos
ts-node orchestrator.ts submit-vaa aptos evm0 latest
ts-node orchestrator.ts submit-vaa evm0 aptos latest

# Wait a couple blocks for confirmation
sleep 3

# Get Current Messages from evm0 and aptos
ts-node orchestrator.ts get-msg evm0
ts-node orchestrator.ts get-msg aptos
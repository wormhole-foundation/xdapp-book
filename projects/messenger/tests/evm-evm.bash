# Install Deps
yarn
#cd chains/evm && forge install --no-git --no-commit && cd ../../

# Deploy evm0 and evm1
ts-node orchestrator.ts deploy evm0
ts-node orchestrator.ts deploy evm1

# Register evm0 on evm1 and vice versa
ts-node orchestrator.ts register-network evm0 evm1
ts-node orchestrator.ts register-network evm1 evm0

# Emit VAA from evm0
ts-node orchestrator.ts emit-msg evm0 "Hello from evm0"
# Emit VAA from evm1
ts-node orchestrator.ts emit-msg evm1 "Hello from evm1"

# Submit evm0 VAA to evm1
ts-node orchestrator.ts submit-vaa evm1 evm0 latest
ts-node orchestrator.ts submit-vaa evm0 evm1 latest

# Wait a couple blocks for confirmation
sleep 3

# Get Current Messages from evm0 and evm1
ts-node orchestrator.ts get-msg evm0
ts-node orchestrator.ts get-msg evm1
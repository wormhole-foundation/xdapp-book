# Warning
echo "Due to the nature of Solana accounts, you'll need to reset the Solana Local Validator (evm can stay as is) every time you run this test, otherwise it'll error saying accounts are already created and in use."

# Install Deps
yarn
#cd chains/evm && forge install --no-git --no-commit && cd ../../

# Build solana code so it's available in the handler
cd chains/solana && anchor build && cd ../../ 

# Deploy evm0 and sol0
ts-node orchestrator.ts deploy evm0
ts-node orchestrator.ts deploy sol0

# Register evm0 on sol0 and vice versa
ts-node orchestrator.ts register-network evm0 sol0
ts-node orchestrator.ts register-network sol0 evm0

# Emit VAA from evm0
ts-node orchestrator.ts emit-msg evm0 "Hello from evm0"
# Emit VAA from sol0
ts-node orchestrator.ts emit-msg sol0 "Hello from sol0"

# Submit evm0 VAA to sol0
ts-node orchestrator.ts submit-vaa sol0 evm0 latest
ts-node orchestrator.ts submit-vaa evm0 sol0 latest

# Wait a couple blocks for confirmation
sleep 3

# Get Current Messages from evm0 and sol0
ts-node orchestrator.ts get-msg evm0
ts-node orchestrator.ts get-msg sol0
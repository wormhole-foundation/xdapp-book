# Example Project: xMint

## Summary

xMint is a sample project that uses Ultra Light Clients and Contract Controlled Transfers to allow users to to pay in their native currency to receive tokens from a foreign chain. It does this by bridging the native currency over to the foreign chain, then purchasing the foreign tokens, and bridging the foreign tokens back to their native chain wallet. 

Behind this simple transaction is a set of complex Wormhole interactions. 


## Setup
Prerequisites:

- wormhole-local-validator installed and running
- anchor 
- foundry-rs

```bash
# starting in xmint root directory
yarn
cd chains/solana
yarn
anchor build
cd ../evm
forge install
cd ../..

cp keypairs/evm0.key.example keypairs/evm0.key
cp keypairs/evm1.key.example keypairs/evm1.key
cp keypairs/sol0.key.example keypairs/sol0.key

npx ts-node orchestrator.ts deploy evm0 
npx ts-node orchestrator.ts deploy evm1 
npx ts-node orchestrator.ts deploy sol0 

ts-node orchestrator.ts register-app evm0 evm1
ts-node orchestrator.ts register-app evm1 evm0
ts-node orchestrator.ts register-app evm0 sol0
ts-node orchestrator.ts register-app evm1 sol0
ts-node orchestrator.ts register-app sol0 evm0
ts-node orchestrator.ts register-app sol0 evm1

ts-node orchestrator.ts buy-token evm0 evm1 5
```

### Contract Deploy

### Register App

## Calls

### Buy Token

### Sell Token

### Balance
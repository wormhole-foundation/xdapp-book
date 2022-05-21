# Tilt Development Environment

For a quicker development cycle, specially when developing your own blockchain programs that interact with Wormhole or Portal contracts, consider setting up the Tilt Devnet Environment. 

Tilt is a kubernetes and docker orchestration tool that will spin up all the Wormhole supported chains in containers, alongside a Guardian node that will observe and store VAAs. 

This devnet environment can be setup on your computer or in a Linux VM that has atleast 4 CPU cores and 16GB of RAM. 

If you do decide to host the devnet in a remote VM, remember to pass in the host and webHost flags during the tilt up step and allow incoming traffic on your VM to be able to access the various RPC endpoints on the Pods.

```sh
tilt up --host=0.0.0.0 -- --webHost=0.0.0.0
```

While the exact commands for each environment might differ, the basic setup process for tilt is the following:

1. Insall Go
2. Install Docker Desktop (Or Docker CE)    
    a. Install Minikube if Docker CE
3. Install Tilt
4. Clone Wormhole Repo and Tilt Up

## FAQ 

### Where are Fantom/Celo/Polygon/...(insert other EVM chains)
For all chains that support EVM the smart contract development environment is effectively the same. For changes in gas costs and transaction times, consider testing contract logic on devnet and then using testnet environments to get chain specific answers. 

### Solana is taking forever!
Unforetunely, due to Solana's architecture, it often takes 25-40min to build the Solana pod. Consider increasing CPU cores assigned to devnet for a faster build.

###  Solana program deploy doesn't work
Kubernetes doesn't currently allow port forwarding for UDP ports, which is what Solana uses for `solana program deploy`. Instead, we reccomend using [Solana Deployer](https://github.com/acheroncrypto/solana-deployer). Not only does this deploy programs over regular RPC thus bypassing UDP port requirements, it's also much faster than `solana program deploy`.

### Reset state for a pod
If you want to quickly iterate and don't want to bring tilt down and back up, you can reset state for a pod by clicking the 🔄 button next to the pod name in Tilt UI.


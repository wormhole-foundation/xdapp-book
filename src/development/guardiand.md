# Guardiand
Guardiand is a way to spin up a guardian node to point to RPC endpoints for running blockchains. By default, the script will spin up 2 Ganache chains, but this can be modified and expanded upon quite easily by editting the `wormhole.sh` file found in most projects. 

## Prerequistes
- Ganache
- Docker

### FAQ & Common Problems
- Anvil isn't working  
While we reccomend Foundry's Forge tool for compling and deploying code elsewhere in these docs, we *do not* at this time reccomend using anvil for guardiand; this is because guardiand is spec'd against go-ethereum, and anvil is out of spec for how it reports block headers (non left padding to normalize length), which means go-ethereum freaks out and can't read anvil headers. 
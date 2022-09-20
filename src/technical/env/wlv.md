# Wormhole Local Validator

## What is Wormhole Local Validator (WLV)?

[Wormhole Local Validator](https://github.com/wormhole-foundation/xdapp-book/tree/main/projects/wormhole-local-validator) is meant to be the simplest custom environment. It consists only of a dockerized Guardian image, and some utility tooling to aid with contract management. This allows you to set it up with any blockchain you'd like.

## Is WLV Right for You?

Here's a succinct list of the pros and cons of the environment, so you can decide if it's the right fit for you.

### Pros

- Lightweight, low system resource demand.
- Fast iteration times.
- Can be added into an existing blockchain development setup.

### Cons

- You may end up reinventing the tilt/testnet environment as you add more components.

## Setting up Wormhole Local Validator

You will need Docker running in order to set up WLV. If you're on desktop, [Docker Desktop](https://docs.docker.com/get-docker/) is generally the best choice, though [Docker Engine](https://docs.docker.com/engine/) works fine too.

From there, you just need nodes for the blockchains you're interested in developing on. There is code to spin up EVM and Solana local validators included in the WLV project repo, as well as scripts to deploy the necessary Wormhole contracts to your local instances.

Further information can be found in the project's [README](https://github.com/wormhole-foundation/xdapp-book/blob/main/projects/wormhole-local-validator/README.md).

## Troubleshooting

Q: Anvil isn't working

- While Foundry's 'forge' tool is the generally recommended tool for EVM contract compilation, anvil isn't currently compatible with guardiand. Anvil reports block headers in a way which is non-compliant with go-ethereum, which means the guardian node can't correctly read anvil headers.

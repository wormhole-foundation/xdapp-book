# xDapp Starter
Simple starter template with Guardiand script and two EVM chains.

## Dependencies
The javascript dependencies can be installed via `npm install` in this folder.

You will also need Docker; you can get either [Docker Desktop](https://docs.docker.com/get-docker/) if you're developing on your computer or if you're in a headless vm, install [Docker Engine](https://docs.docker.com/engine/)

## Run Guardiand
After you have the dependencies installed, we'll need to spin up the EVM chains, deploy the Wormhole contracts to them, then startup a Wormhole Guardian to observe and sign VAAs. We have provided a script to automate this all for you.

Simply run `npm run guardiand` and wait while the Wormhole Guardian builds a docker image. The first time you run this command, it might take a while (up to 550 seconds on a modern laptop!). After the image is built however, it'll be relatively fast to bring it up and down. 

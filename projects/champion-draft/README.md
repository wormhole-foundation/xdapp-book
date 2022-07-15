# Champion Draft

Register your NFTs into Champions and battle other champions!

Champion Draft uses wormhole to allow you to register and battle NFTs from any chain! Audience members can also draft champions from any chain and create communities around them, including cross chain voting. 

## Set up

To set up this project locally, a couple steps are required.

### 1. Set up EVM/Solana chains + Wormhole local validator

1. Clone the xdapp-book repo from certusone
```
git clone https://github.com/certusone/xdapp-book.git
cd xdapp-book
```
2. Navigate to correct directory and install dependancies

```
cd projects/wormhole-local-validator
npm install
```
3. Run EVM chain

```
npm run evm
```

The output should display the following towards the end. Save the address that the NFT token was deployed at.

```
Token deployed at: 0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A
NFT deployed at: 0xaf5C4C6C7920B4883bC6252e9d9B8fE27187Cf68
WETH token deployed at: 0x1b88Bdb8269A1aB1372459F5a4eC3663D6f5cCc4
```

4. (optional) Run Solana chain
Install the [Solana tool chain](https://docs.solana.com/cli/install-solana-cli-tools).

Install the [Anchor framework](https://book.anchor-lang.com/getting_started/installation.html) for Solana.

Start the chain
```
npm run solana
```

4. Finally, run wormhole

```
npm run wormhole
```

The output should look something like this (with only evm chains running):

```
[PM2] Done.
┌─────┬──────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name         │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼──────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ evm0         │ default     │ N/A     │ fork    │ 2250341  │ 2m     │ 0    │ online    │ 0%       │ 63.3mb   │ sya… │ disabled │
│ 1   │ evm1         │ default     │ N/A     │ fork    │ 2250412  │ 2m     │ 0    │ online    │ 0%       │ 63.3mb   │ sya… │ disabled │
│ 2   │ guardiand    │ default     │ 1.0.0   │ fork    │ 2251334  │ 0s     │ 0    │ online    │ 0%       │ 3.1mb    │ sya… │ disabled │
└─────┴──────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

### 2. Clone this repo and deploy contracts

```
sh deploy.sh
```

### 3. Set up redis and server
1. Set up local [redis server](https://redis.io/docs/getting-started/)
2. Install python dependencies, make sure python3.8 is installed

```
cd server
python3 venv venv
. venv/bin/activate
pip install -r requirements.txt
```

3. Start the server. Any subsequent starts can use the startServer.sh script. Make sure the restart the server whenever you redeploy your contracts.

```
sh startServer.sh
```

### 3. Run the frontend

```
cd frontend/
npm install
npm run dev 
```

### 4. Configure metamask

1. [Install metamask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn/related)
2. Log in to the account deployed in step 1

    a. Choose "import existing wallet"
    
    b. Enter the following as the mnemonic

    ```
    myth like bonus scare over problem client lizard pioneer submit female collect
    ```

    c. Create your own personal password (can be anything)

    d. Select enable test networks

    e. Switch your network to localhost:8545

3. Now navigate to your local fronend localhost:3000 and use metamask to interact with the contracts! Here are the NFTs available to you:

```
EVM chains:
Contract: 0xaf5C4C6C7920B4883bC6252e9d9B8fE27187Cf68
Token Id: 0

Contract: 0xaf5C4C6C7920B4883bC6252e9d9B8fE27187Cf68
Token Id: 1
```


## Running Solana Tests
(Perform the following from the `chains/solana` directory in this repo)

Make sure the Solana test validator and Wormhole local validator are running (if you've followed the above you should be ok).

1. Airdrop yourself some funds
```
solana airdrop 100 -k ./tests/test_orchestrator_keypair.json
```

2. Run the test suite
```
anchor test --skip-local-validator # if you have solana running already (for example, if you followed the setup above)
anchor test # if you don't have solana running already
```

## FAQ

**Q:** guardiand is not making VAAs available via HTTP (this could manifest as 404 errors when running the Solana tests or champions not appearing when running the frontend)

**A:** make sure that you run both EVM chains and the Solana chain before starting guardiand.


**Q:** my transactions aren't being initiated or aren't finalizing when interacting from the frontend.

**A:** this is likely an issue with Metamask's nonce. Try reinstalling the Metamask extension.



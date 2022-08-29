import { Command } from 'commander';
import fs from 'fs';
import * as evm from './handlers/evm';
import * as solana from './handlers/solana';

const xmint = new Command();
const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString())

xmint
    .name('xMint')
    .description("Cross chain token minting, transfers, and widrawals.")
    .version("0.1.0");

xmint
    .command("deploy")
    .description("Deploys on chain code.")
    .argument("<src>", "the network you want to deply")
    .action(async (src) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        console.log(`Deploying ${src}...`);

        switch(config.networks[src].type){
            case "evm":
                await evm.deploy(src);
                break;
            case "solana":
                await solana.deploy(src);
                break;
        }

        console.log(`Deploy finished!`);
    });

xmint
    .command("register-app")
    .description("Registers the target app and target token with the source on chain app")
    .argument("<src>", "the network you want to register the app on")
    .argument("<target>", "the network you want to register")
    .action(async (src, target) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        if(!config.networks[target]){
            console.error(`ERROR: ${target} not found in xdapp.config.json`);
            return;
        }

        let srcHandler; 
        switch(config.networks[src].type){
            case "evm":
                srcHandler = evm;
                break;
            case "solana":
                srcHandler = solana;
                break;
        }

        console.log(`Registering ${target} app and token onto ${src} network`)
        await srcHandler.registerApp(src,target)
        try{
            console.log(`Attesting ${src} Wrapped Native to ${target}`);
            await srcHandler.attest(target, src, config.networks[src].wrappedNativeAddress)
        } catch (e) {
            console.log("Wrapped Native attestion exists already")
        }

        console.log(`${target} contract address was registered on ${src} and ${target} token was attested to ${src}`)
    });

xmint
    .command("buy-token")
    .description("buy token using the src network's native currency and bridge it back to src network and hold as bridged funds")
    .argument("<src>", "the network with the native token you want to spend")
    .argument("<target>", "the network whose xmint token you want to buy")
    .argument("<amt>", "amount of token to buy. Always 1 Native : 100 TOKEN")
    .action(async (src, target, amt) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        if(!config.networks[target]){
            console.error(`ERROR: ${target} not found in xdapp.config.json`);
            return;
        }
        if(isNaN(parseInt(amt))){
            console.error(`Error: Invalid Amount!`)
            return;
        }

        // Buy Token On Source
        // SubmitForeignPurchase on Target
        // Claim Tokens on Source
        let srcHandler;
        switch(config.networks[src].type){
            case "evm":
                srcHandler = evm;
                break;
            case "solana":
                srcHandler = solana;
                break;
        }

        let targetHandler;
        switch(config.networks[target].type){
            case "evm":
                targetHandler = evm;
                break;
            case "solana":
                targetHandler = solana;
                break;
        }

        console.log(`Creating Buy VAA on ${src} network...`);
        const buyVAA = await srcHandler.buyToken(src, target, parseInt(amt));
        console.log(`Submitting buy vaa on ${target} network...`);
        const claimTokensVAA = await targetHandler.submitForeignPurchase(target, src, buyVAA);
        console.log(`Claiming tokens on ${src} network...`);
        await srcHandler.claimTokens(src, claimTokensVAA);

        console.log(`Purchase of ${amt} of ${target} network's tokens complete.`)
    });

xmint
    .command("sell-token")
    .description("sells token from target network back to target network for src network's native token")
    .argument("<src>", "the network whose native currency you want to receive")
    .argument("<target>", "the target network whose token you want to sell")
    .argument("<amt>", "amount of token to sell. Always 1 TOKEN : 0.01 NATIVE")
    .action(async (src, targe, amt) => {
        // Sell Token on Source
        // SubmitForeignSale on Target
        // Claim Native
    });

xmint 
    .command("balance")
    .description("gets the balance of the target networks tokens for src network's keys. Pass in src src if you want find native tokens balance on src network")
    .argument("<src>", "the network whose key you want to lookup the balance for")
    .argument("<target>", "the network whose tokens you want to look up the balance for. Pass in src network again to get native token balance. ")
    .action(async (src, target) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        if(!config.networks[target]){
            console.error(`ERROR: ${target} not found in xdapp.config.json`);
            return;
        }

        let balance;
        switch(config.networks[src].type){
            case "evm":
                balance = await evm.balance(src, target);
                break;
            case "solana":
                break;
        }

        console.log(`Balance of ${src} key for ${target} tokens is ${balance}`);
    })

xmint
    .command("debug")
    .action(async () => {
        solana.createWrapped('sol0', 'evm0', 'AQAAAAABAN/Tvs+PQEPxFJzlILkIPBNCEZSDYRmLKAOdJ3ve8ddlL9ZsDFuxKYDdGYg4JvT2F+UghSCBNlWrh+DH8M1yiD4BYw0WejBGAQAAAgAAAAAAAAAAAAAAAAKQ+xZyCK9FW7E3eAFjt7epoQwWAAAAAAAAAAABAgAAAAAAAAAAAAAAAO6i/B0lX9KKoVxsIyStQLAyZ/nFAAISRVZNMFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFVk0wLVRPS0VOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==')
    })

xmint.parse();
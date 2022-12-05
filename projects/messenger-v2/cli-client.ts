import fs from 'fs';
import { AptosClient } from "aptos";
import { Command } from 'commander';
import { AptosMessenger } from './sdk';

const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString())
const program = new Command();

const aptosModuleAddress = "0x277fa055b6a73c42c0662d5236c65c864ccbf2d4abd21f174a30c8b786eab84b"; // Unlike EVM, this is hardcoded
const solanaProgramAddress = ""; // Unlike EVM, this is hardcoded

program
    .name('xMessenger')
    .description("Cross chain messaging example project.")
    .version("2.0.0");

// deploy <network>
program
    .command('deploy')
    .argument('<network>', 'name of the network in xdapp.config.json to deploy')
    .action(async (network:string) => {
        if(!config.networks[network]){
            console.error(`ERROR: ${network} not found in xdapp.config.json`);
            return;
        }
        console.log(`Deploying ${network}...`);

        switch(config.networks[network].type){
            case "aptos":
                let aptosMessenger = new AptosMessenger(config.networks[network].rpc, aptosModuleAddress);
                const txnHash = await aptosMessenger.deploy(config.networks[network].privateKey);
                console.log(`Deployed @ ${txnHash}`);
                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                console.log("Not supported yet");
                break;
        }

        console.log(`Deploy finished!`);
    });

// register network
// send msg
// submit msg
// get msg

program.parse();

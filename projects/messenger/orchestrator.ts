import { Command } from 'commander';
import * as fs from 'fs';
import * as evm from './handlers/evm';
import * as solana from './handlers/solana';

const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString())

const program = new Command();
program
    .name('xMessenger')
    .description("Cross chain messaging example project.")
    .version("0.2.0");

// $ deploy <chain>
program
    .command('deploy')
    .argument('<network>', 'name of the network in xdapp.config.json to deploy')
    .action(async (network) => {
        if(!config.networks[network]){
            console.error(`ERROR: ${network} not found in xdapp.config.json`);
            return;
        }
        console.log(`Deploying ${network}...`);

        switch(config.networks[network].type){
            case "evm":
                await evm.deploy(network);
                break;
            case "solana":
                await solana.deploy(network);
                break;
        }

        console.log(`Deploy finished!`);
    });

// $ register-network <source> <target>
program
    .command("register-network")
    .argument('<source>', 'The network you are registering on.')
    .argument('<target>', 'The foreign network that you want to register.')
    .action(async (src, target) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        if(!config.networks[target]){
            console.error(`ERROR: ${target} not found in xdapp.config.json`);
            return;
        }

        try {
            switch(config.networks[src].type){
                case 'evm':
                    await evm.registerApp(src,target);
                    break;
                case "solana":
                    await solana.registerApp(src, target);
            }

            console.log(`Foreign Network ${target} registered on ${src}`);
        } catch (e){
            console.error(`ERROR: ${e}`)
        }
    });

// $ send-msg <source> <msg>
program
    .command('emit-msg')
    .argument('<source>', 'The network you want to emit the message from')
    .argument('<msg>', 'The message you want to emit')
    .action(async (src, msg) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        try {
            switch(config.networks[src].type){
                case 'evm':
                    await evm.sendMsg(src,msg);
                    break;
                case "solana":
                    await solana.sendMsg(src, msg);
                    break;
            }
            console.log(`Emitted VAA on ${src} network. Submit it using \`submit-vaa\` command on a target network.`)
        } catch (e){
            console.error(`ERROR: ${e}`)
        }
    });

// $ submit-vaa <source> <target> <vaa#>
program
    .command('submit-vaa')
    .argument('<source>', 'The network you want to submit the VAA on')
    .argument('<target>', 'The network you want to submit the VAA from')
    .argument('<vaa#>', 'The index of the VAA in the list of emitted VAAs that you want to submit. Use \'latest\' to submit the latest VAA')
    .action(async (src, target, idx) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }
        if(!config.networks[target]){
            console.error(`ERROR: ${target} not found in xdapp.config.json`);
            return;
        }

        try {
            switch(config.networks[src].type){
                case 'evm':
                    await evm.submitVaa(src,target,idx);
                    break;
                case "solana":
                    await solana.submitVaa(src,target,idx);
                    break;
            }

            console.log(`Submitted VAA #${idx} from ${target} to chain ${src}`);
        } catch (e){
            console.error(`ERROR: ${e}`)
        }
    });

// $ get-msg <source>
program
    .command('get-msg')
    .argument('<source>', 'The chain to fetch the current message from')
    .action(async (src) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }

        let msg = "ERROR!";
        try {
            switch(config.networks[src].type){
                case 'evm':
                    msg = await evm.getCurrentMsg(src);
                    break;
                case "solana":
                    msg = await solana.getCurrentMsg(src);
                    break;
            }

            console.log(`Current Message on Network ${src} is ${msg}`);
        } catch (e){
            console.error(`ERROR: ${e}`)
        }
    })

program.parse();
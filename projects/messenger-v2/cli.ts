import fs from 'fs';
import { AptosAccount, AptosClient, Types } from "aptos";
import { Command } from 'commander';
import { AptosMessenger, EVMMessenger } from './sdk';
import {
    tryNativeToUint8Array,
    generateSignAndSubmitEntryFunction,
    hexToUint8Array,
    parseSequenceFromLogAptos,
    getEmitterAddressSolana,
    getEmitterAddressEth,
} from '@certusone/wormhole-sdk';
import fetch from 'node-fetch';
import ethers from 'ethers';

const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString())
const program = new Command();


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
                let aptosMessenger = new AptosMessenger(config.networks[network].rpc, config.networks[network].deployedAddress);
                const txnHash = await aptosMessenger.deploy(config.networks[network].privateKey);
                console.log(`Deployed @ ${txnHash}`);
                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                let evmMesenger = new EVMMessenger(config.networks[network].rpc, config.networks[network].bridgeAddress);
                await evmMesenger.deploy(network, config.networks[network].privateKey);
                break;
        }

        console.log(`Deploy finished!`);
    });

// register network
program
    .command('register-network')
    .argument("<network>", "The source network")
    .argument("<network>", "The foreign network to be registered")
    .action(async (src, target) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }

        switch(config.networks[src].type){
            case "aptos":
                let aptosMessenger = new AptosMessenger(config.networks[src].rpc, config.networks[src].deployedAddress);
                let targetAddress = tryNativeToUint8Array(config.networks[target].deployedAddress, config.networks[target].wormholeChainId)
                const payload = aptosMessenger.registerNetwork(config.networks[src].bridgeAddress, config.networks[target].wormholeChainId, targetAddress);
                const tx = await generateSignAndSubmitEntryFunction(
                    aptosMessenger.client,
                    new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
                    payload
                );
                const res = await aptosMessenger.client.waitForTransactionWithResult(tx.hash);
                console.log(`Registered @ ${tx.hash}`);

                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                console.log("Not supported yet")
                break;
        }
    });

// send msg
program
    .command('send-msg')
    .argument("<network>", "The source network")
    .argument("<msg>", "The message to be emitted")
    .action(async (src, message) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }

        switch(config.networks[src].type){
            case "aptos":
                let aptosMessenger = new AptosMessenger(config.networks[src].rpc, config.networks[src].deployedAddress);
                const payload = aptosMessenger.sendMessage(message);
                const tx = (await generateSignAndSubmitEntryFunction(
                    aptosMessenger.client,
                    new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
                    payload
                ) as Types.UserTransaction);
                const res = await aptosMessenger.client.waitForTransactionWithResult(tx.hash);
                console.log(`Sent Messagage @ ${tx.hash}`);
                let seq = parseSequenceFromLogAptos(config.networks[src].bridgeAddress, tx);
                let emitter = await aptosMessenger.getEmitterAddress();
                console.log(await getEmitterAddressSolana(config.networks['solana'].deployedAddress));
                console.log(
                    "Searching for: ",
                    `${config.wormhole.restAddress}/v1/signed_vaa/${config.networks[src].wormholeChainId}/${emitter}/${seq}`
                );
                let vaaBytes = undefined;
                while (!vaaBytes) {
                    vaaBytes = (await (
                        await fetch(
                            `${config.wormhole.restAddress}/v1/signed_vaa/${config.networks[src].wormholeChainId}/${emitter}/${seq}`
                            )
                    ).json()).vaaBytes;
                    await new Promise((r) => setTimeout(r, 1000)); // Poll guardiand every sec for message
                }

                console.log("VAA: ", vaaBytes);
                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                console.log("Not supported yet");
                break;
        }
    });

// submit msg
//AQAAAAABALtgDWjywCNRnmIfNU+IkWYUqbzl730v55syJzPmlCwvf3lz9V6Ax9p7ZhMX7kMufwqxNBCkDHlatY5mh5w0cuUAY5+tlgAAAAAAFgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAaGVsbG8=
program
    .command('submit-vaa')
    .argument("<network>", "The source network")
    .argument("<vaa>", "The message to be emitted")
    .action(async (src, vaa) => {
        if(!config.networks[src]){
            console.error(`ERROR: ${src} not found in xdapp.config.json`);
            return;
        }

        switch(config.networks[src].type){
            case "aptos":
                let aptosMessenger = new AptosMessenger(config.networks[src].rpc, config.networks[src].deployedAddress);
                const payload = aptosMessenger.submitMessage(vaa);
                const tx = (await generateSignAndSubmitEntryFunction(
                    aptosMessenger.client,
                    new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
                    payload
                ) as Types.UserTransaction);
                const res = await aptosMessenger.client.waitForTransactionWithResult(tx.hash);
                console.log(`Submitted @ ${tx.hash}`);

                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                console.log("Not supported yet");
                break;
        }
    });


// get msg
program
    .command('get-msg')
    .argument('<network>', 'The network to fetch the message from')
    .action(async (network) => {
        if(!config.networks[network]){
            console.error(`ERROR: ${network} not found in xdapp.config.json`);
            return;
        }
        console.log(`Fetching current message on ${network}...`);

        switch(config.networks[network].type){
            case "aptos":
                let aptosMessenger = new AptosMessenger(config.networks[network].rpc, config.networks[network].deployedAddress);
                console.log(await aptosMessenger.getMessage());
                break;
            case "solana":
                console.log("Not supported yet");
                break;
            case "evm":
                console.log("Not supported yet");
                break;
        }
    });

program.parse();
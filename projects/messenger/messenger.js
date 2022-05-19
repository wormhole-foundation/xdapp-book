import { exec } from "child_process";
import fs from "fs";
import { ethers } from 'ethers';
import {
    CHAIN_ID_ETH,
    getEmitterAddressEth
} from "@certusone/wormhole-sdk";

async function main(){
    let config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());
    
    let network = config.networks[process.argv[2]];
    if (!network){
        throw new Error("Network not defined in config file.")
    }

    if(process.argv[3] == "deploy"){
        if(network.type == "evm"){
            console.log(`Deploying EVM network: ${process.argv[2]} to ${network.rpc}`);
            exec(
                `cd chains/evm && forge build && forge create --legacy --rpc-url ${network.rpc} --private-key ${network.privateKey} src/Messenger.sol:Messenger && exit`,
                ((err, out, errStr) => {
                    if(err){
                        throw new Error(err);
                    } 

                    if(out) {
                        console.log(out);
                        network.deployed_address = out.split("Deployed to: ")[1].split('\n')[0].trim();
                        config.networks[process.argv[2]] = network;
                        fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 4));
                    }
                })
            );
        }
    } else if (process.argv[3] == "register_chain") {
        if(!network.deployed_address){
            throw new Error("Deploy to this network first!");
        }

        if(network.type == "evm"){
            const signer = new ethers.Wallet(network.privateKey)
                .connect(new ethers.providers.JsonRpcProvider(network.rpc));
            
            const targetNetwork = config.networks[process.argv[4]];
            if(!targetNetwork.deployed_address){
                throw new Error("Target Network not deployed yet!");
            }
            if(targetNetwork.type == "evm"){
                const emitter_address = Buffer.from(getEmitterAddressEth(targetNetwork.deployed_address), "hex");
                const messenger = new ethers.Contract(
                    network.deployed_address,
                    JSON.parse(fs.readFileSync('./chains/evm/out/Messenger.sol/Messenger.json').toString()).abi,
                    signer
                );
                const tx = await messenger.registerApplicationContracts(CHAIN_ID_ETH, emitter_address);
                console.log("Registered EVM style Emitter: ", tx.hash);
            }
        }
    } else if (process.argv[2] == "send_msg") {

    } else if (process.argv[2] == "submit_vaa") {

    } else if (process.argv[2] == "get_current_msg") {

    } else {
        throw new Error("Unkown command!")
    }
}

main();
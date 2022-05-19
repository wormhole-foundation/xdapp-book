import { exec } from "child_process";
import fs from "fs";

async function main(){
    let config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());

    if(process.argv[2] == "deploy"){
        let network = config.networks[process.argv[3]];
        if (!network){
            throw new Error("Network not defined in config file.")
        }

        if(network.type == "evm"){
            console.log(`Deploying EVM network: ${process.argv[3]} to ${network.rpc}`);
            exec(
                `cd chains/evm && forge build && forge create --legacy --rpc-url ${network.rpc} --private-key ${network.privateKey} src/Messenger.sol:Messenger && exit`,
                ((err, out, errStr) => {
                    if(err){
                        throw new Error(err);
                    } 

                    if(out) {
                        console.log(out);
                        network.deployed_address = out.split("Deployed to: ")[1].split('\n')[0].trim();
                        config.networks[process.argv[3]] = network;
                        fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 4));
                    }
                })
            );
        }
    } else if (process.argv[2] == "register_chain") {

    } else if (process.argv[2] == "send_msg") {

    } else if (process.argv[2] == "submit_vaa") {

    } else if (process.argv[2] == "get_current_msg") {

    } else {
        console.error("Unknown command!");
    }
}

main();
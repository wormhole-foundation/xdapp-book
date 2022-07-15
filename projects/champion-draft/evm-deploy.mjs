
import { exec } from "child_process";
import fs from "fs";

async function main() {
    let config = JSON.parse(fs.readFileSync("./xdapp.config.json").toString());
    console.log(config);

    let network = config.networks[process.argv[2]];
    if (!network) {
        throw new Error("Network not defined in config file.");
    }

    if (process.argv[3] == "deploy") {
        if (network.type == "evm") {
            console.log(
                `Deploying EVM network: ${process.argv[2]} to ${network.rpc}`
            );

            exec(
                `cd chains/evm && forge build && forge create --legacy --rpc-url ${network.rpc} --private-key ${network.privateKey} src/CoreGame.sol:CoreGame --constructor-args ${network.bridgeAddress} && exit`,
                (err, out, errStr) => {
                    if (err) {
                        console.error(errStr);
                        throw new Error(err);
                    }

                    if (out) {
                        console.log(out);
                        network.deployedAddress = out
                            .split("Deployed to: ")[1]
                            .split("\n")[0]
                            .trim();
                        network.emittedVAAs = []; //Resets the emittedVAAs
                        config.networks[process.argv[2]] = network;
                        fs.writeFileSync(
                            "./xdapp.config.json",
                            JSON.stringify(config, null, 4)
                        );
                    }
                }
            );
        } else {
            throw new Error("Invalid Network Type!");
        }
    } else {
        throw new Error("Invalid subcommand");
    }
}

main()


import { exec } from "child_process";
import fs from "fs";
import { BigNumber, ethers } from "ethers";
import {
    getEmitterAddressEth,
    parseSequenceFromLogEth,
    attestFromEth,
    tryNativeToHexString,
} from "@certusone/wormhole-sdk";

import fetch from "node-fetch";

async function main() {
    let config = JSON.parse(fs.readFileSync("./xdapp.config.json").toString());
    let network = config.networks[process.argv[2]];
    
    let deployment;
    try {
        deployment = JSON.parse(fs.readFileSync("./deployment.json").toString());
    } catch (e) {
        deployment = {};
        deployment[[process.argv[2]]] = {
            deployedAddress: "",
            emittedVAAs: []
        };  
    }

    if (!network) {
        throw new Error("Network not defined in config file.");
    }

    if (process.argv[3] == "deploy") {
        console.log(
            `Deploying EVM network: ${process.argv[2]} to ${network.rpc}`
        );

        exec(
            `cd chains/evm && forge install && forge build && forge create --legacy --rpc-url ${network.rpc} --private-key ${network.privateKey} src/Treasury.sol:Treasury && exit`,
            (err, out, errStr) => {
                if (err) {
                    throw new Error(err);
                }

                if (out) {
                    console.log(out);
                    deployment[[process.argv[2]]] = {
                        deployedAddress: "",
                        emittedVAAs: []
                    };                     
                    deployment[process.argv[2]].deployedAddress = out
                        .split("Deployed to: ")[1]
                        .split("\n")[0]
                        .trim();
                    deployment[process.argv[2]].emittedVAAs = []; 
                    
                    fs.writeFileSync(
                        "./deployment.json",
                        JSON.stringify(deployment, null, 4)
                    );
                }
            }
        );
    } else if (process.argv[3] == "register_chain") {
        if (!deployment[process.argv[2]].deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const targetNetwork = config.networks[process.argv[4]];
        const targetDeployment = deployment[process.argv[4]]
        if (!targetDeployment.deployedAddress) {
            throw new Error("Target Network not deployed yet!");
        }

        let emitterAddr = Buffer.from(
                getEmitterAddressEth(targetDeployment.deployedAddress),
                "hex"
            );

        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );

        const treasury = new ethers.Contract(
            deployment[process.argv[2]].deployedAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/Treasury.sol/Treasury.json"
                    )
                    .toString()
            ).abi,
            signer
        );
        await treasury.registerApplicationContracts(
            targetNetwork.wormholeChainId,
            emitterAddr
        );
        console.log(
            `Network(${process.argv[2]}) Registered Emitter: ${targetDeployment.deployedAddress} from Chain: ${process.argv[4]}`
        );
    } else if (process.argv[3] == "get_tokens") {
        if (!deployment[process.argv[2]].deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );
        const treasury = new ethers.Contract(
            deployment[process.argv[2]].deployedAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/Treasury.sol/Treasury.json"
                    )
                    .toString()
            ).abi,
            signer
        );

        const TKN = new ethers.Contract(
            network.testToken,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/ERC20PresetMinterPauser.sol/ERC20PresetMinterPauser.json"
                    )
                    .toString()
            ).abi,
            signer
        );  
        console.log(`${process.argv[2]} Treasury has ${await treasury.getTKNCount()} tokens.`);
        const tokenAmt = ethers.utils.parseUnits(process.argv[4], "18");
        console.log(`Minting ${tokenAmt} tokens.`);
        await TKN.mint(deployment[process.argv[2]].deployedAddress, tokenAmt, {
            gasLimit: 2000000
        });
        await new Promise((r) => setTimeout(r, 3000));
        console.log(`${process.argv[2]} Treasury has ${await treasury.getTKNCount()} tokens.`);
    } else if (process.argv[3] == "attest_token") {
        if (!deployment[process.argv[2]].deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );
        
        const networkTokenAttestation = await attestFromEth(
            network.tokenBridgeAddress,
            signer,
            network.testToken
        );

        const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
        const seq = parseSequenceFromLogEth(networkTokenAttestation, network.bridgeAddress);
        const vaaURL =  `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
        console.log("Searching for: ", vaaURL);
        let vaaBytes = await (await fetch(vaaURL)).json();
        while(!vaaBytes.vaaBytes){
            console.log("VAA not found, retrying in 5s!");
            await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
            vaaBytes = await (await fetch(vaaURL)).json();
        }

        if (!deployment[process.argv[2]].emittedVAAs) {
            deployment[process.argv[2]].emittedVAAs = [vaaBytes.vaaBytes];
        } else {
            deployment[process.argv[2]].emittedVAAs.push(vaaBytes.vaaBytes);
        }
    
        fs.writeFileSync(
            "./deployment.json",
            JSON.stringify(deployment, null, 2)
        );
        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            vaaBytes.vaaBytes
        );
        
        // Now create the Wrapped Version of the Token on the target chain
        const targetNetwork = config.networks[process.argv[4]];
        const targetDeployment = deployment[process.argv[4]];
        const targetSigner = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(targetNetwork.rpc)
        );
        const targetTokenBridge = new ethers.Contract(
            targetNetwork.tokenBridgeAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/ITokenBridge.sol/ITokenBridge.json"
                    )
                    .toString()
            ).abi,
            targetSigner
        );    

        await targetTokenBridge.createWrapped(Buffer.from(vaaBytes.vaaBytes, "base64"), {
            gasLimit: 2000000
        })
        await new Promise((r) => setTimeout(r, 5000)); //Time out to let block propogate
        const wrappedTokenAddress = await targetTokenBridge.wrappedAsset(network.wormholeChainId, Buffer.from(tryNativeToHexString(network.testToken, "ethereum"), "hex"));
        console.log("Wrapped token created at: ", wrappedTokenAddress);
        targetDeployment["wrappedTestTokenAddress"] = wrappedTokenAddress;

        deployment[process.argv[4]] = targetDeployment;
        fs.writeFileSync('./deployment.json', JSON.stringify(deployment, null, 4));
    } else if (process.argv[3] == "get_token_counts") {
        if (!deployment[process.argv[2]].deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );

        const treasury = new ethers.Contract(
            deployment[process.argv[2]].deployedAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/Treasury.sol/Treasury.json"
                    )
                    .toString()
            ).abi,
            signer
        );

        console.log(`${process.argv[2]} Treasury has ${await treasury.getTKNCount()} native TKN.`)
        if(deployment[process.argv[2]]['wrappedTestTokenAddress']){
            console.log(`${process.argv[2]} Treasury has ${await treasury.getWrappedCount(deployment[process.argv[2]]['wrappedTestTokenAddress'])} wrapped TKN.`)
        }
    } else if (process.argv[3] == "bridge_token") {
        if (!deployment[process.argv[2]].deployedAddress) {
            throw new Error("Deploy to this network first!");
        }

        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );

        const treasury = new ethers.Contract(
            deployment[process.argv[2]].deployedAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/Treasury.sol/Treasury.json"
                    )
                    .toString()
            ).abi,
            signer
        );
        
        //Multiply out the decimals to 18 (default for ERC20)
        const bridgeAmt = ethers.utils.parseUnits(process.argv[5], "18");


        // Remember to allow Token Bridge to move tokens from Treasury account to it's own account
        console.log(`Approving ${process.argv[5]} (${bridgeAmt} in proper ERC20 format) Tokens to be bridged by Token Bridge`);
        await treasury.approveTokenBridge(bridgeAmt, {
            gasLimit: 2000000,
        });
        await new Promise((r) => setTimeout(r, 5000)); //Time out to let block propogate

        const targetNetwork = config.networks[process.argv[4]];
        const targetDeployment = deployment[process.argv[4]]
        if (!targetDeployment.deployedAddress) {
            throw new Error("Target Network not deployed yet!");
        }

        console.log(`Bridging ${process.argv[5]} Tokens which is ${bridgeAmt} Tokens`);
        const targetRecepient = Buffer.from(tryNativeToHexString(targetDeployment.deployedAddress, "ethereum"), 'hex');
        const tx = await (await treasury.bridgeToken(bridgeAmt, targetNetwork.wormholeChainId, targetRecepient)).wait();
        const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
        const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
        const vaaURL =  `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
        let vaaBytes = await (await fetch(vaaURL)).json();
        while(!vaaBytes.vaaBytes){
            console.log("VAA not found, retrying in 5s!");
            await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
            vaaBytes = await (await fetch(vaaURL)).json();
        }

        if (!deployment[process.argv[2]].emittedVAAs) {
            deployment[process.argv[2]].emittedVAAs = [vaaBytes.vaaBytes];
        } else {
            deployment[process.argv[2]].emittedVAAs.push(vaaBytes.vaaBytes);
        }
    
        fs.writeFileSync(
            "./deployment.json",
            JSON.stringify(deployment, null, 2)
        );

        console.log(
            `Network(${process.argv[2]}) Emitted VAA: `,
            vaaBytes.vaaBytes
        );

        // Now create the Wrapped Version of the Token on the target chain
        const targetSigner = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(targetNetwork.rpc)
        );
        const targetTokenBridge = new ethers.Contract(
            targetNetwork.tokenBridgeAddress,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/ITokenBridge.sol/ITokenBridge.json"
                    )
                    .toString()
            ).abi,
            targetSigner
        );    
        const completeTransferTx = await targetTokenBridge.completeTransfer(Buffer.from(vaaBytes.vaaBytes, "base64"));
        console.log("Complete Transfer TX: ", await completeTransferTx.wait());
    } else if (process.argv[3] == "debug") {
        const signer = new ethers.Wallet(network.privateKey).connect(
            new ethers.providers.JsonRpcProvider(network.rpc)
        );

        const TKN = new ethers.Contract(
            network.testToken,
            JSON.parse(
                fs
                    .readFileSync(
                        "./chains/evm/out/ERC20PresetMinterPauser.sol/ERC20PresetMinterPauser.json"
                    )
                    .toString()
            ).abi,
            signer
        );  

        console.log((await TKN.allowance(deployment[process.argv[2]].deployedAddress, network.tokenBridgeAddress)).toNumber());
        console.log((await TKN.balanceOf(network.tokenBridgeAddress)).toNumber());
    } else {
        throw new Error("Unkown command!");
    }
}
main();

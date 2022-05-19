import { exec } from "child_process";
import fs from "fs";
import { ethers } from 'ethers';
import algo from "algosdk";
import {
    getEmitterAddressAlgorand,
    getEmitterAddressEth,
    getEmitterAddressSolana,
    getEmitterAddressTerra,
    parseSequenceFromLogEth,
    parseSequenceFromLogAlgorand,
    uint8ArrayToHex
} from "@certusone/wormhole-sdk";

import  {
    optin,
    submitVAAHeader
} from "@certusone/wormhole-sdk/lib/cjs/algorand/Algorand.js";

import fetch from 'node-fetch';

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
                        network.deployedAddress = out.split("Deployed to: ")[1].split('\n')[0].trim();
                        network.emittedVAAs = []; //Resets the emittedVAAs
                        config.networks[process.argv[2]] = network;
                        fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 4));
                    }
                })
            );
        } else if (network.type == "algorand"){
            console.log(`Deploying Algorand network: ${process.argv[2]} to ${network.rpc}`);
            exec(
                `cd chains/algorand && python3 messenger.py ${network.bridgeAddress} '${network.mnemonic}' ${network.rpc}:${network.port}`,
                ((err,out,errStr) => {
                    if(err) {
                        throw new Error(err);
                    } 

                    if(out){
                        console.log(out);
                        network.appId = parseInt(out.split("App ID:")[1].split("Address")[0].trim());
                        network.deployedAddress = out.split("Address: ")[1].trim();
                        network.emittedVAAs = [];
                        config.networks[process.argv[2]] = network;
                        fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 4));
                    }
                })
            )
        } else {
            throw new Error("Invalid Network Type!");
        }
    } else if (process.argv[3] == "register_chain") {
        if(!network.deployedAddress){
            throw new Error("Deploy to this network first!");
        }

        const targetNetwork = config.networks[process.argv[4]];
        if(!targetNetwork.deployedAddress){
            throw new Error("Target Network not deployed yet!");
        }

        let emitterAddr;
        if(targetNetwork.type == "evm"){
            emitterAddr = Buffer.from(getEmitterAddressEth(targetNetwork.deployedAddress), "hex");
        } else if (targetNetwork.type == "algorand") {
            emitterAddr = Buffer.from(getEmitterAddressAlgorand(targetNetwork.appId), "hex");
        } else if (targetNetwork.type == "solana") {
            emitterAddr = Buffer.from(await getEmitterAddressSolana(targetNetwork.deployedAddress), "hex");
        } else if (targetNetwork.type == "terra") {
            emitterAddr = Buffer.from(await getEmitterAddressTerra(targetNetwork.deployedAddress), "hex");
        }


        if(network.type == "evm"){
            const signer = new ethers.Wallet(network.privateKey)
                .connect(new ethers.providers.JsonRpcProvider(network.rpc));

            const messenger = new ethers.Contract(
                network.deployedAddress,
                JSON.parse(fs.readFileSync('./chains/evm/out/Messenger.sol/Messenger.json').toString()).abi,
                signer
            );
            await messenger.registerApplicationContracts(targetNetwork.wormholeChainId, emitterAddr);
        } else if (network.type == "algorand"){
            const algodClient = new algo.Algodv2(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 
                network.rpc,
                network.port
            );
            const sender = algo.mnemonicToSecretKey(network.mnemonic);
            const params = await algodClient.getTransactionParams().do();
            let txs = [];
            txs.push({
                tx: algo.makeApplicationCallTxnFromObject({
                    appArgs: [
                        Uint8Array.from(Buffer.from("registerEmitter")),
                        Uint8Array.from(emitterAddr),
                        algo.bigIntToBytes(BigInt(targetNetwork.wormholeChainId), 2)
                    ],
                    appIndex: network.appId,
                    from: sender.addr,
                    onComplete: algo.OnApplicationComplete.NoOpOC,
                    suggestedParams: params,
                }),
                signer: null,
            });
            await signSendAndConfirmAlgorand(algodClient, txs, sender);
        }
        console.log(`Network(${process.argv[2]}) Registered Emitter: ${targetNetwork.deployedAddress} from Chain: ${targetNetwork.wormholeChainId}`);
    } else if (process.argv[3] == "send_msg") {
        if(!network.deployedAddress){
            throw new Error("Deploy to this network first!");
        }

        if(network.type == "evm"){
            const signer = new ethers.Wallet(network.privateKey)
                .connect(new ethers.providers.JsonRpcProvider(network.rpc));
            const messenger = new ethers.Contract(
                network.deployedAddress,
                JSON.parse(fs.readFileSync('./chains/evm/out/Messenger.sol/Messenger.json').toString()).abi,
                signer
            );
            const tx = await (await messenger.sendMsg(Buffer.from(process.argv[4]))).wait();
            await new Promise((r) => setTimeout(r, 5000));
            const emitterAddr = getEmitterAddressEth(messenger.address);
            const seq = parseSequenceFromLogEth(
                tx,
                network.bridgeAddress
            );
            const vaaBytes = await (
                await fetch(
                    `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`
                )
            ).json();
            if(!network.emittedVAAs){
                network.emittedVAAs = [vaaBytes.vaaBytes];
            } else {
                network.emittedVAAs.push(vaaBytes.vaaBytes);
            }
            config.networks[process.argv[2]] = network;
            fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 2));
            console.log(`Network(${process.argv[2]}) Emitted VAA: `, vaaBytes.vaaBytes);
        } else if (network.type == "algorand"){
            const algodClient = new algo.Algodv2(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 
                network.rpc,
                network.port
            );
            const sender = algo.mnemonicToSecretKey(network.mnemonic);
            const params = await algodClient.getTransactionParams().do();
            let txs = [];

            //Opt In to allow core brige to store data with Algo Contract
            const messengerPubkey = uint8ArrayToHex(algo.decodeAddress(network.deployedAddress).publicKey);
            const { addr: emitterAddr, txs: emitterOptInTxs } = await optin(
                algodClient,
                sender.addr,
                BigInt(network.bridgeAddress),
                BigInt(0),
                messengerPubkey
            );
            txs.push(...emitterOptInTxs);
            let accts = [
                emitterAddr,
                algo.getApplicationAddress(network.bridgeAddress),
            ];
            let appTxn = algo.makeApplicationCallTxnFromObject({
                appArgs: [
                    Uint8Array.from(Buffer.from("sendMessage")),
                    Uint8Array.from(Buffer.from(process.argv[4]))
                ],
                accounts: accts,
                appIndex: network.appId,
                foreignApps: [network.bridgeAddress],
                from: sender.addr,
                onComplete: algo.OnApplicationComplete.NoOpOC,
                suggestedParams: params,
            });
            appTxn.fee *= 2;
            txs.push({tx: appTxn, signer: null});
            const receipt = await signSendAndConfirmAlgorand(algodClient, txs, sender);
            const emitAddr = getEmitterAddressAlgorand(network.appId);
            const seq = parseSequenceFromLogAlgorand(receipt);
            await new Promise((r) => setTimeout(r, 10000));
            const vaaBytes = await (
                await fetch(
                    `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitAddr}/${seq}`
                )
            ).json();
            if(!network.emittedVAAs){
                network.emittedVAAs = [vaaBytes.vaaBytes];
            } else {
                network.emittedVAAs.push(vaaBytes.vaaBytes);
            }
            config.networks[process.argv[2]] = network;
            fs.writeFileSync('./xdapp.config.json', JSON.stringify(config, null, 2));
            console.log(`Network(${process.argv[2]}) Emitted VAA: `, vaaBytes.vaaBytes);
        }
    } else if (process.argv[3] == "submit_vaa") {
        if(!network.deployedAddress){
            throw new Error("Deploy to this network first!");
        }
        const targetNetwork = config.networks[process.argv[4]];
        const vaaBytes = isNaN(parseInt(process.argv[5])) ?
            targetNetwork.emittedVAAs.pop() :
            targetNetwork.emittedVAAs[parseInt(process.argv[5])];
    
        if(network.type == "evm"){

            const signer = new ethers.Wallet(network.privateKey)
                .connect(new ethers.providers.JsonRpcProvider(network.rpc));
            const messenger = new ethers.Contract(
                network.deployedAddress,
                JSON.parse(fs.readFileSync('./chains/evm/out/Messenger.sol/Messenger.json').toString()).abi,
                signer
            );
            
            const tx = await messenger.receiveEncodedMsg(Buffer.from(vaaBytes, "base64"));
            console.log(`Submitted VAA: ${vaaBytes}\nTX: ${tx.hash}`);
        } else if (network.type == "algorand"){
            const algodClient = new algo.Algodv2(
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 
                network.rpc,
                network.port
            );
            const sender = algo.mnemonicToSecretKey(network.mnemonic);
            const params = await algodClient.getTransactionParams().do();
            let txs = [];
            
            let sstate = await submitVAAHeader(algodClient, BigInt(network.bridgeAddress), Uint8Array.from(Buffer.from(vaaBytes, "base64")), sender.addr, BigInt(network.appId))
            txs = sstate.txs;
            let accts = sstate.accounts;
    
            txs.push({
                tx: algo.makeApplicationCallTxnFromObject({
                    appArgs: [
                        Uint8Array.from(Buffer.from(("receiveMessage"))),
                        Uint8Array.from(Buffer.from(vaaBytes, "base64"))
                    ],
                    accounts: accts,
                    appIndex: network.appId,
                    from: sender.addr,
                    onComplete: algo.OnApplicationComplete.NoOpOC,
                    suggestedParams: params,
                }),
                signer: null,
            });
    
            ret = await signSendAndConfirmAlgorand(algodClient, txs, sender);
            console.log(ret);    
        }
    } else if (process.argv[3] == "get_current_msg") {
        if(!network.deployedAddress){
            throw new Error("Deploy to this network first!");
        }
        if(network.type == "evm"){
            const signer = new ethers.Wallet(network.privateKey)
                .connect(new ethers.providers.JsonRpcProvider(network.rpc));
            const messenger = new ethers.Contract(
                network.deployedAddress,
                JSON.parse(fs.readFileSync('./chains/evm/out/Messenger.sol/Messenger.json').toString()).abi,
                signer
            );
            console.log(`${process.argv[2]} Current Msg: `, await messenger.getCurrentMsg());
        }
    } else {
        throw new Error("Unkown command!")
    }
}

async function signSendAndConfirmAlgorand(
    algodClient,
    txs,
    wallet
) {
    algo.assignGroupID(txs.map((tx) => tx.tx));
    const signedTxns = [];
    for (const tx of txs) {
        if (tx.signer) {
            signedTxns.push(await tx.signer.signTxn(tx.tx));
        } else {
            signedTxns.push(tx.tx.signTxn(wallet.sk));
        }
    }
    await algodClient.sendRawTransaction(signedTxns).do();
    const result = await algo.waitForConfirmation(
        algodClient,
        txs[txs.length - 1].tx.txID(),
        1
    );
    return result;
}

main();
import {
    generateSignAndSubmitEntryFunction,
    getEmitterAddressEth,
    getEmitterAddressSolana,
    hexToUint8Array,
    parseSequenceFromLogAptos,
  } from "@certusone/wormhole-sdk";
  import { 
    AptosAccount, 
    AptosClient, 
    Types,
  } from "aptos";
  import { promisify } from "util";
  const exec = promisify(require("child_process").exec);
import * as fs from 'fs';
import fetch from "node-fetch";


const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());
const coreMessages = "0x277fa055b6a73c42c0662d5236c65c864ccbf2d4abd21f174a30c8b786eab84b";

export async function deploy(src:string){
    const privateKey = config.networks[src].privateKey;
    const rpc = config.networks[src].rpc;

    let cmd = `cd chains/aptos && aptos move compile --save-metadata && aptos move publish --private-key ${privateKey} --url ${rpc} --assume-yes`;
    const { stdout, stderr } = await exec(cmd);
    //console.log(stdout);

    console.log("Initalizing Aptos Messenger module...");
    // Initialize the module to register its emitter capability
    const sender = new AptosAccount(hexToUint8Array(privateKey));
    const payload:Types.EntryFunctionPayload = {
      function: `${coreMessages}::messenger::init_messenger`,
      type_arguments: [],
      arguments: [
        sender.address()
      ],
    };

    const client = new AptosClient(rpc);

    const tx = await generateSignAndSubmitEntryFunction(
      client,
      sender,
      payload
    );
    
    const res = await client.waitForTransactionWithResult(tx.hash);
    //console.log(JSON.stringify(res, null, 2));

    fs.writeFileSync(`./deployinfo/${src}.deploy.json`, JSON.stringify({
        address: coreMessages,
        vaas: []
    }, null, 4))

    return res.hash;
}

export async function registerApp(src:string, target:string){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    let srcDeploymentInfo;
    let targetDeploymentInfo;
    let targetEmitter;

    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }

    try{
        targetDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${target} is not deployed yet`);
    }

    switch (targetNetwork['type']){
        case 'evm': 
            targetEmitter = getEmitterAddressEth(targetDeploymentInfo['address']);
            break;
        case 'solana':
            targetEmitter = await getEmitterAddressSolana(targetDeploymentInfo['address']);
            break;
        case 'aptos':
            targetEmitter = await getEmitterAddress(config.networks[src].rpc, targetDeploymentInfo['address']);
            break;
    }
    
    const payload = {
        function: `${coreMessages}::messenger::register_emitter`,
        type_arguments: [],
        arguments: [
          targetNetwork.wormholeChainId, 
          Buffer.from(targetEmitter, 'hex')
        ],
    }

    const client = new AptosClient(srcNetwork.rpc);

    const tx = await generateSignAndSubmitEntryFunction(
        client,
        new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
        payload
    );

    const res = await client.waitForTransactionWithResult(tx.hash);
    console.log(`Registered @ ${tx.hash}`);
}

export async function sendMsg(src:string, msg:string){
    const client = new AptosClient(config.networks[src].rpc);

    const payload = {
      function: `${coreMessages}::messenger::send_message`,
      type_arguments: [],
      arguments: [
        Buffer.from(msg)
      ],
    }
    
    const tx = (await generateSignAndSubmitEntryFunction(
        client,
        new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
        payload
    ) as Types.UserTransaction);

    const res = await client.waitForTransactionWithResult(tx.hash);
    console.log(`Sent Messagage @ ${tx.hash}`);
    
    let seq = parseSequenceFromLogAptos(config.networks[src].bridgeAddress, tx);
    let emitter = await getEmitterAddress(config.networks[src].rpc, coreMessages);
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

    let srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    if(!srcDeploymentInfo['vaas']){
        srcDeploymentInfo['vaas'] = [vaaBytes]
    } else {
        srcDeploymentInfo['vaas'].push(vaaBytes)
    }
    fs.writeFileSync(
        `./deployinfo/${src}.deploy.json`,
        JSON.stringify(srcDeploymentInfo, null, 4)
    );
    
    return vaaBytes;
}

export async function submitVaa(src:string, target:string, idx: string){
    const srcNetwork = config.networks[src];
    let srcDeploymentInfo;
    let targetDeploymentInfo;

    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }

    try{
        targetDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${target} is not deployed yet`);
    }

    const vaa = isNaN(parseInt(idx))
    ? targetDeploymentInfo.vaas.pop()
    : targetDeploymentInfo.vaas[parseInt(idx)];

    const payload = {
        function: `${coreMessages}::messenger::receive_message`,
        type_arguments: [],
        arguments: [
          Buffer.from(vaa, 'base64')
        ],
    }

    const client = new AptosClient(srcNetwork.rpc);
    const tx = (await generateSignAndSubmitEntryFunction(
        client,
        new AptosAccount(hexToUint8Array(config.networks[src].privateKey)),
        payload
    ) as Types.UserTransaction);
    const res = await client.waitForTransactionWithResult(tx.hash);
    console.log(`Submitted @ ${tx.hash}`);
    
    return tx.hash;
}

export async function getCurrentMsg(src:string){
    const srcNetwork = config.networks[src];
    let srcDeploymentInfo;

    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }

    let resourceAccAddress = AptosAccount.getResourceAccountAddress(
        `${coreMessages}`,
        Buffer.from("messenger_state")
    );
  
    const client = new AptosClient(srcNetwork.rpc);
    let state = await client.getAccountResource(
        resourceAccAddress,
        `${coreMessages}::messenger::State`
    );

    return (state.data as any).current_message; 
}

export async function getEmitterAddress(rpc: string, deployedContractAddress:string): Promise<string> {
    let resourceAccAddress = AptosAccount.getResourceAccountAddress(
      `${deployedContractAddress}`,
      Buffer.from("messenger_state")
    );

    const client = new AptosClient(rpc);
    let state = await client.getAccountResource(
      resourceAccAddress,
      `${deployedContractAddress}::messenger::State`
    );

    return Number((state.data as any).emitter_cap.emitter).toString(16).padStart(64, '0');
}
import * as fs from 'fs';
import { exec } from "child_process";
import { getEmitterAddressEth, getEmitterAddressSolana, parseSequenceFromLogEth, setDefaultWasm } from '@certusone/wormhole-sdk';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());

export async function deploy(chain: string){
    const rpc = config.networks[chain]['rpc'];
    const privateKey = config.networks[chain]['privateKey'];
 
    exec(
        `cd chains/evm && forge build && forge create --legacy --rpc-url ${rpc} --private-key ${privateKey} src/Messenger.sol:Messenger && exit`,
        (err, out, errStr) => {
            if (err) {
                throw new Error(err.message);
            }

            if (out) {
                console.log(out);
                const deploymentAddress = out
                    .split("Deployed to: ")[1]
                    .split("\n")[0]
                    .trim();
                const emittedVAAs = []; //Resets the emittedVAAs
                fs.writeFileSync(
                    `./deployinfo/${chain}.deploy.json`,
                    JSON.stringify({
                        address: deploymentAddress,
                        vaas: emittedVAAs
                    }, null, 4)
                );
            }
        }
    );
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
            setDefaultWasm("node"); // *sigh*
            targetEmitter = await getEmitterAddressSolana(targetDeploymentInfo['address']);
            break;
    }

    const emitterBuffer = Buffer.from(targetEmitter, 'hex');
    const signer = new ethers.Wallet(srcNetwork.privateKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );
    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/Messenger.sol/Messenger.json"
                )
                .toString()
        ).abi,
        signer
    );
    const tx = await messenger.registerApplicationContracts(
        targetNetwork.wormholeChainId,
        emitterBuffer
    );
    return tx;
}

export async function sendMsg(src:string, msg:string){
    const srcNetwork = config.networks[src];
    let srcDeploymentInfo;
    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }
    const signer = new ethers.Wallet(srcNetwork.privateKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );
    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/Messenger.sol/Messenger.json"
                )
                .toString()
        ).abi,
        signer
    );

    const tx = await (await messenger.sendMsg(Buffer.from(msg))).wait();
    const seq = parseSequenceFromLogEth(tx, srcNetwork['bridgeAddress']);
    const emitterAddr = getEmitterAddressEth(srcDeploymentInfo['address']);
    

    await new Promise((r) => setTimeout(r, 5000)); //wait for Guardian to pick up message
    console.log(
        "Searching for: ",
        `${config.wormhole.restAddress}/v1/signed_vaa/${srcNetwork.wormholeChainId}/${emitterAddr}/${seq}`
    );
    const vaaBytes = await (
        await fetch(
            `${config.wormhole.restAddress}/v1/signed_vaa/${srcNetwork.wormholeChainId}/${emitterAddr}/${seq}`
        )
    ).json();

    if(!vaaBytes['vaaBytes']){
        throw new Error("VAA not found!");
    }

    if(!srcDeploymentInfo['vaas']){
        srcDeploymentInfo['vaas'] = [vaaBytes['vaaBytes']]
    } else {
        srcDeploymentInfo['vaas'].push(vaaBytes['vaaBytes'])
    }
    fs.writeFileSync(
        `./deployinfo/${src}.deploy.json`,
        JSON.stringify(srcDeploymentInfo, null, 4)
    );
    return vaaBytes['vaaBytes'];
}

export async function submitVaa(src:string, target:string, idx:string){
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

    const signer = new ethers.Wallet(srcNetwork.privateKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );
    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/Messenger.sol/Messenger.json"
                )
                .toString()
        ).abi,
        signer
    );
    const tx = await messenger.receiveEncodedMsg(Buffer.from(vaa, "base64"));

    return tx;
}

export async function getCurrentMsg(src:string){
    const srcNetwork = config.networks[src];
    let srcDeploymentInfo;

    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }
    const signer = new ethers.Wallet(srcNetwork.privateKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/Messenger.sol/Messenger.json"
                )
                .toString()
        ).abi,
        signer
    );
    
    return await messenger.getCurrentMsg();
}  
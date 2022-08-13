import * as fs from 'fs';
import { 
    attestFromEth, 
    createWrappedOnEth, 
    getEmitterAddressEth, 
    getEmitterAddressSolana, 
    getForeignAssetEth, 
    parseSequenceFromLogEth, 
    redeemOnEth, 
    setDefaultWasm, 
    transferFromEthNative, 
    tryNativeToUint8Array,
} from '@certusone/wormhole-sdk';
import * as ethers from 'ethers';
import fetch from 'node-fetch';
import { promisify } from 'util';
import * as solana from './solana';

const exec = promisify(require('child_process').exec);
const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());

let ABI;
try {
    ABI = JSON.parse(fs.readFileSync("./chains/evm/out/Xmint.sol/Xmint.json").toString()).abi
} catch (e) {
    // fail silenty
    // The only time this fails is when deploy hasn't been called, in which case, this isn't needed
}

/**
 * 1. Deploy on chain contract "XMint"
 * @param src The network to deploy
 */
export async function deploy(src: string){
    const rpc = config.networks[src]['rpc'];
    const core = config.networks[src]['bridgeAddress'];
    const token = config.networks[src]['tokenBridgeAddress'];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
    const { stdout , stderr } = await exec(
        `cd chains/evm && forge build && forge create --legacy --rpc-url ${rpc} --private-key ${key} src/Xmint.sol:Xmint --constructor-args "${src.toUpperCase()}-TOKEN" "${src.toUpperCase()}T" ${core} ${token} && exit`
    )

    if (stderr) {
        throw new Error(stderr.message);
    }

    let deploymentAddress:string;
    if (stdout) {
        console.log(stdout);
        deploymentAddress = stdout
            .split("Deployed to: ")[1]
            .split("\n")[0]
            .trim();
        const emittedVAAs = []; //Resets the emittedVAAs
        fs.writeFileSync(
            `./deployinfo/${src}.deploy.json`,
            JSON.stringify({
                address: deploymentAddress,
                vaas: emittedVAAs
            }, null, 4)
        );
    }
}

/**
 * Registers the cross chain mint contracts with one another across chains
 * @param src The network you want to register the foreign network on.
 * @param target The foreign network
 */
export async function registerApp(src:string, target:string){
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();

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
    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        ABI,
        signer
    );

    const tx = await messenger.registerApplicationContracts(
        targetNetwork.wormholeChainId,
        emitterBuffer
    );
    console.log(`Registered ${target} network on ${src}`);
    await new Promise((r) => setTimeout(r, 1000)); //wait for blocks to advance

    // Alongside registering the App, go ahead register the tokens with one another
    // Register target token with src chain
    
    switch(targetNetwork['type']){
        case 'evm':
            await attest(target, src);
            break;
        case 'solana':
            await solana.attest(target, src);
            break;
    }
    console.log(`Attested ${target} network on ${src}`);
}


/**
 * Attest token on src and create wrapped on target
 * @param src 
 * @param target 
 * @param address 
 */
export async function attest(src: string, target: string, address:string = null){
    //Check TARGET type == EVM, else throw error
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = fs.readFileSync(`keypairs/${src}.key`).toString();


    const srcSigner = new ethers.Wallet(srcKey).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    console.log(`Attesting ${src} Network Token on ${target} Network`)
    
    if(!address){
        address = srcDeployInfo.address;
    }
    
    const tx = await attestFromEth(
        srcNetwork.tokenBridgeAddress,
        srcSigner,
        address,
        {
            gasLimit: 1500000
        }
    )

    // in this context the target is network we're attesting *from* so it's the network the vaa comes from (hence being placed as the 'source')
    // The emitter for this is PORTAL, not our contract, so we set portal=true in fetchVaa
    const attestVaa = await fetchVaa(src, tx, true);

    switch(srcNetwork.type){
        case "evm":
            await createWrapped(target, attestVaa)
            break;
        case "solana":
            await solana.createWrapped(target, attestVaa)
            break;
    }
}


/**
 * The 'target' here is the chain you want to attest from, which is the first step.
 * This is why we kick it off in that handler. For example, if I want to attest EVM0-Token to Sol0
 * We should attestFromEth() and then createWrappedOnSolana()
 * @param src The chain you want to attest the token on 
 * @param target The chain whose token you want to attest
 */
export async function attestOld(src: string, target: string, address:string = null){
    //Check TARGET type == EVM, else throw error
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const targetKey = fs.readFileSync(`keypairs/${target}.key`).toString();

    if(targetNetwork.type != "evm"){
        throw new Error("Wrong handler called to attest!");
    }

    const targetSigner = new ethers.Wallet(targetKey).connect(
        new ethers.providers.JsonRpcProvider(targetNetwork.rpc)
    );

    console.log(`Attesting ${target} Network Token on ${src} Network`)
    
    if(!address){
        address = targetDeployInfo.address;
    }
    
    const tx = await attestFromEth(
        targetNetwork.tokenBridgeAddress,
        targetSigner,
        address,
        {
            gasLimit: 1500000
        }
    )

    // in this context the target is network we're attesting *from* so it's the network the vaa comes from (hence being placed as the 'source')
    // The emitter for this is PORTAL, not our contract, so we set portal=true in fetchVaa
    const attestVaa = await fetchVaa(target, tx, true);

    switch(srcNetwork.type){
        case "evm":
            await createWrapped(src, attestVaa)
            break;
        case "solana":
            await solana.createWrapped(src, attestVaa)
            break;
    }
}

export async function createWrapped(src:string, vaa:string){
    const srcNetwork = config.networks[src];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );
    await createWrappedOnEth(
        srcNetwork.tokenBridgeAddress,
        signer,
        Buffer.from(vaa, 'base64'),
        {
            gasLimit: 1000000
        }
    );
}

async function fetchVaa(src:string, tx:ethers.ethers.ContractReceipt, portal:boolean = false){
    const srcNetwork = config.networks[src];
    const srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());

    const seq = parseSequenceFromLogEth(tx, srcNetwork['bridgeAddress']);
    let emitterAddr = "";
    if(portal){
        emitterAddr = getEmitterAddressEth(srcNetwork['tokenBridgeAddress']);
    } else {
        emitterAddr = getEmitterAddressEth(srcDeploymentInfo['address']);
    }    
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

    console.log("VAA Found: ", vaaBytes.vaaBytes);
    return vaaBytes.vaaBytes;
}

function writeVaa(src:string, vaa:string){
    const srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    if(!srcDeploymentInfo['vaas']){
        srcDeploymentInfo['vaas'] = [vaa]
    } else {
        srcDeploymentInfo['vaas'].push(vaa)
    }
    fs.writeFileSync(
        `./deployinfo/${src}.deploy.json`,
        JSON.stringify(srcDeploymentInfo, null, 4)
    );
}

/**
 * Submits target Purchase VAA onto src network
 * @param src The EVM type of network that the VAA is being submitted to
 * @param target The target network which initiated the purchase
 * @param vaa The b64 encoded VAA
 */
export async function submitForeignPurchase(src:string, target:string, vaa:string) : Promise<string> {
    const srcNetwork = config.networks[src];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
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

    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    const messenger = new ethers.Contract(
        srcDeploymentInfo.address,
        ABI,
        signer
    );

    //This will mint tokens and create a VAA to transfer them back over to the src chain
    fs.writeFileSync('vaa.u8', Uint8Array.from(Buffer.from(vaa, 'base64')).toString());
    const tx = await messenger.submitForeignPurchase(Buffer.from(vaa, "base64"), {gasLimit: 1000000});
    console.log("SFP Tx: ", tx);
    const claimTokensVaa = fetchVaa(src, tx);
    return claimTokensVaa;
}

/**
 * Claims the tokens generated on a foreign network onto the key in the source network
 * @param src The chain you want to claim the vaa on
 * @param vaa The vaa you want to claim
 */
export async function claimTokens(src:string, vaa:string){
    const srcNetwork = config.networks[src];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
    let srcDeploymentInfo;

    try{
        srcDeploymentInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    } catch (e){
        throw new Error(`${src} is not deployed yet`);
    }

    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    await redeemOnEth(
        srcNetwork.tokenBridgeAddress,
        signer,
        Buffer.from(vaa, "base64"),
        {
            gasLimit: 1000000
        }
    )
}

export async function submitForeignSale(src:string, target:string, vaa:string){

}

/**
 * Creates a P3 VAA that can only be redeemed by target contract with src key as recipient address
 * @param src 
 * @param target 
 * @param amount 
 * @returns 
 */
export async function buyToken(src:string, target: string, amount: number): Promise<string> {
    //Buy Token on Target Chain with SRC Native Currency
        // Create P3 VAA that pays X native and has the Receipient Address set to XMINT on Target Chain & payload is src key
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
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

    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    //For this project, 1 Native Token will always equal 100 Chain Tokens, no matter the source or target chains
    const amt = ethers.BigNumber.from(amount/100); //how much native you want to transfer to buy AMT worth of Tokens on target chain
    const targetChainAddress = tryNativeToUint8Array(targetDeploymentInfo.address, targetNetwork.wormholeChainId);

    //The payload is just the purchaser's public key
    // This is used to send a Payload 1 Transfer of Tokens back
    // If it errors, will send a Refund VAA back
    const purchaseOrderPayload = tryNativeToUint8Array(await signer.getAddress(), srcNetwork.wormholeChainId); 

    const tx = await transferFromEthNative(
        srcNetwork['tokenBridgeAddress'],
        signer,
        amt, 
        targetNetwork.wormholeChainId,
        targetChainAddress,
        ethers.BigNumber.from(0),
        {
            gasLimit: 1000000
        },
        purchaseOrderPayload
    );

    // The buy order will be written to the SRC chain's vaa list
    // Needs to be submitted to target chain with `submitForeignPurchase`
    const vaa = await fetchVaa(src, tx, true);
    writeVaa(src, vaa);
    return vaa;
}

export async function balance(src:string, target: string){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const key = fs.readFileSync(`keypairs/${src}.key`).toString();
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

    const signer = new ethers.Wallet(key).connect(
        new ethers.providers.JsonRpcProvider(srcNetwork.rpc)
    );

    if(src == target){
        //Get native currency balance
        return await signer.getBalance()
    }

    // Else get the Token Balance of the Foreign Network's token on Src Network
    const foreignAddress = await getForeignAssetEth(
        srcNetwork.tokenBridgeAddress,
        signer,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetDeploymentInfo.address, targetNetwork.wormholeChainId)
    );

    const TKN = new ethers.Contract(
        foreignAddress,
        JSON.parse(
            fs
                .readFileSync(
                    "./chains/evm/out/PortalWrappedToken.sol/PortalWrappedToken.json"
                )
                .toString()
        ).abi,
        signer
    );

    return (<ethers.BigNumber>(await TKN.balanceOf(await signer.getAddress()))).toNumber()  
}
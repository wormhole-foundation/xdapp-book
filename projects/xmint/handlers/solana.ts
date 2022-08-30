import fs from 'fs';
import fetch from 'node-fetch';
import { promisify  } from 'util';
import * as evm from './evm';
import * as anchor from '@project-serum/anchor';
import { Solana as SolanaTypes} from '../chains/solana/target/types/solana';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { 
    attestFromSolana, 
    createWrappedOnSolana, 
    getEmitterAddressEth,
    getEmitterAddressSolana, 
    getForeignAssetSolana, 
    parseSequenceFromLogSolana, 
    postVaaSolanaWithRetry, 
    setDefaultWasm, 
    tryNativeToUint8Array 
} from '@certusone/wormhole-sdk';
import * as byteify from 'byteify';
import {
    getAccount,
    getOrCreateAssociatedTokenAccount,
    createMint
} from '@solana/spl-token'

const exec = promisify(require('child_process').exec);
const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());
const IDL = JSON.parse(fs.readFileSync('./chains/solana/target/idl/solana.json').toString());
const CONTRACT_ADDRESS = "BHz6MJGvo8PJaBFqaxyzgJYdY6o8h1rBgsRrUmnHCU9k";

export async function deploy(src: string){
    const rpc = config.networks[src].rpc;
    const core = config.networks[src].bridgeAddress;
    const token = config.networks[src].tokenBridgeAddress;
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString()))));
    const connection = new anchor.web3.Connection(rpc);

    // Request Airdrop for saved keypair
    console.log("Requesting Funds...");
    await connection.requestAirdrop(srcKey.publicKey, 1e9*1000); //request 1000 SOL
    await new Promise((r) => setTimeout(r, 20000)); //wait for the airdrop to go through
    console.log(`${srcKey.publicKey.toString()} balance: `, await (connection.getBalance(srcKey.publicKey)));

    //Compile and Deploy Solana Code
    console.log("Compiling and deploying solana code takes a min, hang on...");
    const cmd = `cd chains/solana && solana config set -u ${rpc} -k keypairs/id.json && anchor build && anchor deploy --program-name solana --program-keypair keypairs/solana-keypair.json && exit`
    
    const {stdout, stderr} = await exec (cmd);
    console.log(stdout);

    // Also initalize the contract
    //Initalize the Contract
    const xmint = new anchor.Program<SolanaTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            new anchor.web3.Connection(rpc),
            new anchor.Wallet(srcKey),
            {}));
    
    const [configAcc, _] = findProgramAddressSync([
        Buffer.from("config")
    ], xmint.programId);
    
    // Deploy the SPL Token for Xmint
    const mint = await createMint(
        connection,
        srcKey,
        xmint.programId,
        xmint.programId,
        9 // We are using 9 to match the CLI decimal default exactly
    );
    await new Promise((r) => setTimeout(r, 15000)) // wait for the chain to recognize the program

    await xmint.methods
            .initialize(
                mint
            )
            .accounts({
                config: configAcc,
                owner: xmint.provider.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId
            })
            .rpc();

    // Store deploy info
    fs.writeFileSync(`./deployinfo/${src}.deploy.json`, JSON.stringify({
        address: CONTRACT_ADDRESS,
        tokenAddress: mint,
        vaas: []
    }, null, 4));
}

/**
 * Attest token from src chain and create wrapped on target chain
 * @param src 
 * @param target 
 * @param address 
 */
export async function attest(src: string, target:string, address:string = null){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);

    // If we don't pass in an address (like for WSOL) we assume we want to attest the xmint token
    if(!address){
        address = srcDeployInfo.tokenAddress;
    }
    console.log(`Attesting ${address} from ${src} network onto ${target}`);
    
    setDefaultWasm("node");
    const tx = await attestFromSolana(
        connection,
        srcNetwork.bridgeAddress,
        srcNetwork.tokenBridgeAddress,
        srcKey.publicKey.toString(),
        address 
    );
    tx.partialSign(srcKey);
    const txid = await connection.sendRawTransaction(tx.serialize());
    console.log("TXID: ", txid);

    const attestVaa = await fetchVaa(src, txid, true);
    switch(targetNetwork.type){
        case "evm":
            await evm.createWrapped(target, src, attestVaa);
            break;
        case "solana":
            await createWrapped(target, src, attestVaa);
    }
}

/**
 * Fetches the signed VAA from the Gaurdian. Will use xmint as emitter if portal=false
 * @param src 
 * @param tx 
 * @param portal 
 */
async function fetchVaa(src:string, tx:string, portal:boolean=false):Promise<string>{
    const srcNetwork = config.networks[src];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);
   
    setDefaultWasm("node");
    const emitterAddr = portal ? await getEmitterAddressSolana(srcNetwork.tokenBridgeAddress) : await getEmitterAddressSolana(srcDeployInfo.address);
    let transaction = await connection.getTransaction(tx); 
    let timeElapsed = 0;
    while (!transaction) {
        await new Promise((r) => setTimeout(r, 1000)) // wait for the chain to recognize the program
        transaction = await connection.getTransaction(tx);
        timeElapsed += 1;
    }
    console.log(`VAA from TX(${tx}) found in ${timeElapsed}s`);
    const seq = parseSequenceFromLogSolana(transaction);
    await new Promise((r) => setTimeout(r, 5000)); //wait for gaurdian to pick up messsage
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


export async function createWrapped(src:string, target:string, vaa:string){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);

    setDefaultWasm("node");
    //Have to Post the VAA first before we can use it
    await postVaaSolanaWithRetry(
        connection,
        async (transaction) => {
            transaction.partialSign(srcKey);
            return transaction;
        },
        srcNetwork.bridgeAddress,
        srcKey.publicKey.toString(),
        Buffer.from(vaa, "base64"),
        10
    );

    const tx = await createWrappedOnSolana(
        connection,
        srcNetwork.bridgeAddress,
        srcNetwork.tokenBridgeAddress,
        srcKey.publicKey.toString(),
        Buffer.from(vaa, "base64")
    );
    tx.partialSign(srcKey);
    const txid = await connection.sendRawTransaction(tx.serialize());
    console.log("TXID: ", txid);

    await new Promise((r) => setTimeout(r, 15000)); // wait for blocks to advance before fetching new foreign address
    const foreignAddress = await getForeignAssetSolana(
        connection,
        srcNetwork.tokenBridgeAddress,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetDeployInfo.tokenAddress, targetNetwork.wormholeChainId)
    );
    console.log(`${src} Network has new PortalWrappedToken for ${target} network at ${foreignAddress}`);
}

export async function debug(){
    const src = "sol0";
    const target = 'evm0';
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);

    setDefaultWasm("node");
    await new Promise((r) => setTimeout(r, 20000)); // wait for blocks to advance before fetching new foreign address
    const foreignAddress = await getForeignAssetSolana(
        connection,
        srcNetwork.tokenBridgeAddress,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetDeployInfo.tokenAddress, targetNetwork.wormholeChainId)
    );
    console.log(`${src} Network has new PortalWrappedToken for ${target} network at ${foreignAddress}`);
}


export async function registerApp(src:string, target:string){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);
    let targetEmitter;
    switch (targetNetwork.type){
        case 'evm': 
            targetEmitter = getEmitterAddressEth(targetDeployInfo.address);
            break;
        case 'solana':
            targetEmitter = await getEmitterAddressSolana(targetDeployInfo.address);
            break;
    }

    const xmint = new anchor.Program<SolanaTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(srcKey),
            {}));
 
    const [emitterAcc, emitterBmp] = findProgramAddressSync([
        Buffer.from("EmitterAddress"),
        byteify.serializeUint16(targetNetwork.wormholeChainId)
    ], xmint.programId);

    const [configAcc, _] = findProgramAddressSync([
        Buffer.from("config")
    ], xmint.programId);
    

    const tx = await xmint.methods
                            .registerChain(
                                targetNetwork.wormholeChainId,
                                targetEmitter
                            )
                            .accounts({
                                config: configAcc,
                                emitterAcc: emitterAcc,
                                owner: xmint.provider.publicKey,
                                systemProgram: anchor.web3.SystemProgram.programId
                            })  
                            .rpc();
    console.log(`Registered ${target} contract on ${src}`);
    // Alongside registering the App, go ahead register the tokens with one another
    // Register target token with src chain
    console.log(`Attesting ${target} token on ${src}`);
    switch(targetNetwork.type){
        case "evm":
            await evm.attest(target, src);
            break;
        case "solana":
            await attest(target, src);
            break;
    }
    console.log(`Attested ${target} token on ${src}`);
}

export async function submitForeignPurchase(src:string, target:string, vaa:string){}
export async function submitForeignSale(src:string, target:string, vaa:string){}
export async function sellToken(src:string, target:string, amount:number){}

export async function balance(src: string, target: string) : Promise<string>{
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);

    if (src == target) {
        //Get Native Currency
        return (await connection.getBalance(srcKey.publicKey)).toString()
    }

    setDefaultWasm("node")
    // Else get the Token Balance of the Foreign Network's token on the Src Network
    const foreignAddress = await getForeignAssetSolana(
        connection,
        srcNetwork.tokenBridgeAddress,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetDeployInfo.tokenAddress, targetNetwork.wormholeChainId)
    );

    const tokenAccountAddress = await getOrCreateAssociatedTokenAccount(
        connection,
        srcKey,
        new anchor.web3.PublicKey(foreignAddress),
        srcKey.publicKey,
    );

    const tokenAccount = await getAccount(
        connection,
        tokenAccountAddress.address
    )

    return tokenAccount.amount.toString();
}

export async function buyToken(src:string, target: string, amount:number){

}

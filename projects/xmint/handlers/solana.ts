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
    tryNativeToUint8Array,
    importCoreWasm 
} from '@certusone/wormhole-sdk';
import * as byteify from 'byteify';
import {
    getAccount,
    getOrCreateAssociatedTokenAccount,
    createMint,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import {
    PROGRAM_ID as metaplexProgramID,
} from '@metaplex-foundation/mpl-token-metadata';
import keccak256 from "keccak256";

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
    
    const [configAcc, _] = findProgramAddressSync([Buffer.from("config")], xmint.programId);
    
    // Deploy the SPL Token for Xmint
    const mintAuthorityPDA = findProgramAddressSync([Buffer.from("mint_authority")], xmint.programId)[0];

    const mint = await createMint(
        connection,
        srcKey,
        mintAuthorityPDA, 
        mintAuthorityPDA, 
        9, // We are using 9 to match the CLI decimal default exactly
    );

    await new Promise((r) => setTimeout(r, 15000)) // wait for the chain to recognize the program

    const metadataAccount = findProgramAddressSync([
        Buffer.from("metadata"),
        metaplexProgramID.toBuffer(),
        mint.toBuffer()
    ], metaplexProgramID)[0]

    /*
    const tokenReceipientAddress = getOrCreateAssociatedTokenAccount(
        connection,
        srcKey,
        //WETH MINT\\,

    )
    */

    const redeemerAcc = findProgramAddressSync([Buffer.from("redeemer")], xmint.programId)[0];

    // Initalize will also CPI into metaplex metadata program to setup metadata for the token
    await xmint.methods
            .initialize(
                `${src}-TOKEN`,
                `${src}T`,
                ""
            )
            .accounts({
                config: configAcc,
                owner: srcKey.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                mint: mint,
                mintAuthority: mintAuthorityPDA,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                metadataAccount: metadataAccount,
                metadataProgram: metaplexProgramID,
                redeemer: redeemerAcc
            })
            .rpc();

    await new Promise((r) => setTimeout(r, 15000)) // wait for the chain to recognize the metadata

    // Store deploy info
    fs.writeFileSync(`./deployinfo/${src}.deploy.json`, JSON.stringify({
        address: CONTRACT_ADDRESS,
        tokenAddress: mint,
        tokenReceipientAddress: redeemerAcc.toString(),
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

    await new Promise((r) => setTimeout(r, 25000)); // wait for blocks to advance before fetching new foreign address
    const foreignAddress = await getForeignAssetSolana(
        connection,
        srcNetwork.tokenBridgeAddress,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetDeployInfo.tokenAddress, targetNetwork.wormholeChainId)
    );
    console.log(`${src} Network has new PortalWrappedToken for ${target} network at ${foreignAddress}`);

    //If the attestation is WETH, save the ATA for config of the WETH mint as recipient address
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
    let targetEmitter:String;
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
                                Buffer.from(targetEmitter, 'hex'),
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
    // Buy token on target chain with SOL on SRC chain
        // Create p3 that pays SOL, reciepient address is 
}

export async function submitForeignPurchase(src:string, target:string, vaa:string){
    const srcNetwork = config.networks[src];
    const targetNetwork = config.networks[target];
    const srcDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${src}.deploy.json`).toString());
    const targetDeployInfo = JSON.parse(fs.readFileSync(`./deployinfo/${target}.deploy.json`).toString());
    const srcKey = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse((fs.readFileSync(`keypairs/${src}.key`).toString())
    )));
    const connection = new anchor.web3.Connection(srcNetwork.rpc);

    setDefaultWasm("node");
    // Post the VAA to Solana Chain for signature verification
    await postVaaSolanaWithRetry(
        connection,
        async (tx) => {
            tx.partialSign(srcKey);
            return tx;
        },
        srcNetwork.bridgeAddress,
        srcKey.publicKey.toString(),
        Buffer.from(vaa, "base64"),
        10
    );

    const xmint = new anchor.Program<SolanaTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            connection,
            new anchor.Wallet(srcKey),
            {}));
    const { parse_vaa } = await importCoreWasm(); //this function can only be imported from the WASM right now, not directly
    const parsed_vaa = parse_vaa(Buffer.from(vaa, 'base64'));
    const vaaHash = getVaaHash(parsed_vaa); //await getSignedVAAHash(Buffer.from(vaa, "base64"));

    // Account that we stored the registered foreign emitter
    let emitterAddressAcc = findProgramAddressSync([
        byteify.serializeUint16(parsed_vaa.emitter_chain),
        Buffer.from(parsed_vaa.emitter_address, 'hex')
    ], new anchor.web3.PublicKey(srcNetwork.tokenBridgeAddress))[0];

    // A blank account we're creating just to keep track of already processed messages
    let targetEmitterAddress;
    switch (targetNetwork.type) {
        case "evm":
            targetEmitterAddress = getEmitterAddressEth(targetNetwork.tokenBridgeAddress);
            break;
        case "solana":
            targetEmitterAddress = await getEmitterAddressSolana(targetNetwork.tokenBridgeAddress);
    }
    let processedVaaKey = findProgramAddressSync([
        Buffer.from(targetEmitterAddress, "hex"),
        byteify.serializeUint16(parsed_vaa.emitter_chain),
        byteify.serializeUint64(parsed_vaa.sequence)
    ], xmint.programId)[0];

    // Account where the core bridge stored the vaa after the signatures checked out
    const tokenBridgePubKey = new anchor.web3.PublicKey(srcNetwork.tokenBridgeAddress);
    const coreBridgePubKey = new anchor.web3.PublicKey(srcNetwork.bridgeAddress);
    let coreBridgeVaaKey = findProgramAddressSync([
        Buffer.from("PostedVAA"),
        Buffer.from(vaaHash, 'hex')
    ], coreBridgePubKey)[0]
    const [configAcc, _] = findProgramAddressSync([Buffer.from("config")], xmint.programId);

    // Accounts for Completing P3
    const tokenBridgeConfigAcc = findProgramAddressSync([Buffer.from("config")], tokenBridgePubKey)[0];
    const tokenBridgeClaimAcc = findProgramAddressSync([
        Buffer.from(targetEmitterAddress, "hex"),
        byteify.serializeUint16(parsed_vaa.emitter_chain),
        byteify.serializeUint64(parsed_vaa.sequence)
    ], tokenBridgePubKey)[0];


    // WETH is being transferred in, so we need the WETH Portal Mint on Solana
    const wethMint = new anchor.web3.PublicKey(await getForeignAssetSolana(
        connection,
        srcNetwork.tokenBridgeAddress,
        targetNetwork.wormholeChainId,
        tryNativeToUint8Array(targetNetwork.wrappedNativeAddress, targetNetwork.wormholeChainId)
    ));

    const wethWrappedMeta = findProgramAddressSync([
        Buffer.from("meta"),
        wethMint.toBuffer()
    ], tokenBridgePubKey)[0];

    const mintAuthorityWrapped = findProgramAddressSync([
        Buffer.from("mint_signer")
    ], tokenBridgePubKey)[0];

    const redeemerAcc = findProgramAddressSync([Buffer.from("redeemer")], xmint.programId)[0];
    const wethAtaAcc = await getOrCreateAssociatedTokenAccount(
        connection,
        srcKey,
        wethMint,
        redeemerAcc,
        true // Allow off curve because the owner of the mintATA acc is a PDA
    );

    const tx = await xmint.methods 
        .submitForeignPurchase()
        .accounts({
            payer: srcKey.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            config: configAcc,
            coreBridgeVaa: coreBridgeVaaKey,
            processedVaa: processedVaaKey,
            emitterAcc: emitterAddressAcc,
            tokenBridgeConfig: tokenBridgeConfigAcc,
            tokenBridgeClaimKey: tokenBridgeClaimAcc,
            wethAtaAccount: wethAtaAcc.address,
            feeRecipient: wethAtaAcc.address,
            wethMint: wethMint,
            wethMintWrappedMeta: wethWrappedMeta,
            mintAuthorityWrapped: mintAuthorityWrapped,
            rentAccount: anchor.web3.SYSVAR_RENT_PUBKEY,
            tokenBridgeProgram: tokenBridgePubKey,
            splProgram: TOKEN_PROGRAM_ID,
            redeemer:redeemerAcc,
        })
        .preInstructions([
            anchor.web3.ComputeBudgetProgram.requestUnits({
                units: 1400000,
                additionalFee: 0,
            })
        ])
        .rpc();

    }


export async function sellToken(src:string, target:string, amount:number){}
export async function submitForeignSale(src:string, target:string, vaa:string){}

function getVaaHash(parsed_vaa){
    //Create VAA Hash to use in core bridge key
    let buffer_array = []
    buffer_array.push(byteify.serializeUint32(parsed_vaa.timestamp));
    buffer_array.push(byteify.serializeUint32(parsed_vaa.nonce));
    buffer_array.push(byteify.serializeUint16(parsed_vaa.emitter_chain));
    buffer_array.push(Uint8Array.from(parsed_vaa.emitter_address));
    buffer_array.push(byteify.serializeUint64(parsed_vaa.sequence));
    buffer_array.push(byteify.serializeUint8(parsed_vaa.consistency_level));
    buffer_array.push(Uint8Array.from(parsed_vaa.payload));
    const hash = keccak256(Buffer.concat(buffer_array));
    return hash.toString("hex");
}
import * as fs from 'fs';
import { exec } from "child_process";
import { Solana as MessengerTypes} from '../chains/solana/target/types/solana';
import fetch from 'node-fetch';
import { 
    getEmitterAddressEth,
    getEmitterAddressSolana, 
    importCoreWasm, 
    parseSequenceFromLogSolana, 
    postVaaSolanaWithRetry, 
    setDefaultWasm,
    getSignedVAAHash, 
} from '@certusone/wormhole-sdk';
import * as anchor from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import * as byteify from 'byteify';
import keccak256 from 'keccak256';


const config = JSON.parse(fs.readFileSync('./xdapp.config.json').toString());
const IDL = JSON.parse(fs.readFileSync("./chains/solana/target/idl/solana.json").toString());
const CONTRACT_ADDRESS = "24FoTeX7BKbhTh3UF3feWusoAVKDPWZneiEqhXLVzZPL";
const KEYPAIR = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('./chains/solana/keypairs/id.json').toString())));

export async function deploy(src: string){
    const rpc = config.networks[src]['rpc'];

    //Request Airdrop for saved keypair (because Local Validator probably started with the keypair in ~/.config)
    const connection = new anchor.web3.Connection(rpc);
    await connection.requestAirdrop(KEYPAIR.publicKey, 1e9*1000); //request 1000 SOL
    await new Promise((r) => setTimeout(r, 15000)); // wait for the airdrop to go through

    console.log("This will take a couple minutes due to Solana being solana...");
    exec(
        `cd chains/solana && solana config set -u ${rpc} -k keypairs/id.json && anchor build && anchor deploy --program-name solana --program-keypair keypairs/solana-keypair.json && exit`,
        (err, out, errStr) => {
            if(err){
                throw new Error(err.message);
            }
            if(out) {
                fs.writeFileSync(
                    `./deployinfo/${src}.deploy.json`,
                    JSON.stringify({
                        address: CONTRACT_ADDRESS,
                        vaas: []
                    }, null, 4)
                );

                new Promise((r) => setTimeout(r, 15000)) // wait for the chain to recognize the program
                .then(async () => {
                    //Initalize the Contract
                    const messenger = new anchor.Program<MessengerTypes>(
                        IDL,
                        CONTRACT_ADDRESS,
                        new anchor.AnchorProvider(
                            new anchor.web3.Connection(rpc),
                            new anchor.Wallet(KEYPAIR),
                            {}));
                    
                    const [configAcc, _] = findProgramAddressSync([
                        Buffer.from("config")
                    ], messenger.programId);

                    await messenger.methods.initialize()
                            .accounts({
                                config: configAcc,
                                owner: messenger.provider.publicKey,
                                systemProgram: anchor.web3.SystemProgram.programId
                            })
                            .rpc();
                        
                    })
            }
        }
    )
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
    }

    const messenger = new anchor.Program<MessengerTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            new anchor.web3.Connection(srcNetwork['rpc']),
            new anchor.Wallet(KEYPAIR),
            {}));

    const [emitterAcc, emitterBmp] = findProgramAddressSync([
        Buffer.from("EmitterAddress"),
        byteify.serializeUint16(targetNetwork.wormholeChainId)
    ], messenger.programId)

    const [configAcc, configBmp] = findProgramAddressSync([
        Buffer.from("config")
    ], messenger.programId);

    const tx = await messenger.methods
                                .registerChain(
                                    targetNetwork.wormholeChainId,
                                    targetEmitter
                                )
                                .accounts({
                                    owner: messenger.provider.publicKey,
                                    systemProgram: anchor.web3.SystemProgram.programId,
                                    config: configAcc,
                                    emitterAcc: emitterAcc
                                })
                                .rpc();
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

    const messenger = new anchor.Program<MessengerTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            new anchor.web3.Connection(srcNetwork['rpc']),
            new anchor.Wallet(KEYPAIR),
            {}   
        ));

    const whCoreBridge = new anchor.web3.PublicKey(srcNetwork.bridgeAddress);
    const whConfig = findProgramAddressSync([Buffer.from("Bridge")], whCoreBridge)[0];
    const whFeeCollector = findProgramAddressSync([Buffer.from("fee_collector")], whCoreBridge)[0];
    //The emitter address for Solana contracts is *NOT* the contract address, but rather a PDA of the Contract
    const whDerivedEmitter = findProgramAddressSync([Buffer.from("emitter")], messenger.programId)[0];
    const whSequence = findProgramAddressSync([Buffer.from("Sequence"), whDerivedEmitter.toBytes()], whCoreBridge)[0];
    
    //Throw away account used to store the message as logs on Solana are not archived for long term retreival 

    const whMessageKeypair = anchor.web3.Keypair.generate();
    
    const [configAcc, configBmp] = findProgramAddressSync([
        Buffer.from("config")
    ], messenger.programId);      

    const tx = await messenger.methods
                            .sendMsg(msg)
                            .accounts({
                                coreBridge: whCoreBridge,
                                wormholeConfig: whConfig,
                                wormholeFeeCollector: whFeeCollector,
                                wormholeDerivedEmitter: whDerivedEmitter,
                                wormholeSequence: whSequence,
                                wormholeMessageKey: whMessageKeypair.publicKey,
                                payer: messenger.provider.publicKey,
                                systemProgram: anchor.web3.SystemProgram.programId,
                                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                                config: configAcc
                            })
                            .signers([
                                whMessageKeypair
                            ])
                            .rpc();

    const seq = parseSequenceFromLogSolana(await messenger.provider.connection.getTransaction(tx))
    setDefaultWasm("node"); // *sigh*
    const emitterAddr = await getEmitterAddressSolana(messenger.programId.toString()); //same as whDerivedEmitter
    
    await new Promise((r) => setTimeout(r, 5000)); // Wait for guardian to pick up message

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
    setDefaultWasm("node"); //WASM will be removed very soon, but until then, all the solana functions rely on it

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

    const messenger = new anchor.Program<MessengerTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            new anchor.web3.Connection(srcNetwork['rpc']),
            new anchor.Wallet(KEYPAIR),
            {}   
        ));

    //Submitting the VAA is a 2 step process
    // First we submit it to core bridge to validate the signatures
    await postVaaSolanaWithRetry(
        messenger.provider.connection,
        async (tx) => {
            tx.partialSign(KEYPAIR);
            return tx;
        },
        srcNetwork.bridgeAddress,
        KEYPAIR.publicKey.toString(),
        Buffer.from(vaa, "base64"),
        10
    );

    // Then we submit to our program to go through the program's checks
    await new Promise((r) => setTimeout(r, 5000));
    
    const { parse_vaa } = await importCoreWasm(); //this function can only be imported from the WASM right now, not directly

    const parsed_vaa = parse_vaa(Buffer.from(vaa, 'base64'));
    const vaaHash = getVaaHash(parsed_vaa); //await getSignedVAAHash(Buffer.from(vaa, "base64"));
    //console.log("Hash: ", vaaHash, await getSignedVAAHash(Buffer.from(vaa, "base64")));

    // Account that we stored the registered foreign emitter
    let emitterAddressAcc = findProgramAddressSync([
        Buffer.from("EmitterAddress"),
        byteify.serializeUint16(parsed_vaa.emitter_chain)
    ], messenger.programId)[0];

    // A blank account we're creating just to keep track of already processed messages
    let processedVaaKey = findProgramAddressSync([
        Buffer.from(getEmitterAddressEth(targetDeploymentInfo.address), "hex"),
        byteify.serializeUint16(parsed_vaa.emitter_chain),
        byteify.serializeUint64(parsed_vaa.sequence)
    ], messenger.programId)[0];

    // Account where the core bridge stored the vaa after the signatures checked out
    let coreBridgeVaaKey = findProgramAddressSync([
        Buffer.from("PostedVAA"),
        Buffer.from(vaaHash, 'hex')
    ], new anchor.web3.PublicKey(srcNetwork.bridgeAddress))[0]

    let configAcc = findProgramAddressSync([Buffer.from("config")], messenger.programId)[0];

    //Confirm via Messenger Code
    // will set the current message to the one in the vaa
    const tx = await messenger.methods
        .confirmMsg()
        .accounts({
            payer: KEYPAIR.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
            processedVaa: processedVaaKey,
            emitterAcc: emitterAddressAcc,
            coreBridgeVaa: coreBridgeVaaKey,
            config: configAcc            
        })
        .rpc({skipPreflight: true});
    
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

    const messenger = new anchor.Program<MessengerTypes>(
        IDL,
        CONTRACT_ADDRESS,
        new anchor.AnchorProvider(
            new anchor.web3.Connection(srcNetwork['rpc']),
            new anchor.Wallet(KEYPAIR),
            {}   
        ));
    
    const configAcc = findProgramAddressSync([
        Buffer.from('config')
    ], messenger.programId)[0]

    const configAccountData = await messenger.account.config.fetch(configAcc);
    return configAccountData.currentMsg;
}

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
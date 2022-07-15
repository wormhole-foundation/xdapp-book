import * as anchor from "@project-serum/anchor";
import { web3 } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  deriveAddress,
  getPdaAssociatedTokenAddress,
  makeReadOnlyAccountMeta,
  makeWritableAccountMeta,
} from "./helpers/utils";
import keccak256 from "keccak256";
import { CoreGame } from "../target/types/core_game";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { CORE_BRIDGE_ADDRESS } from "./helpers/consts";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  CHAIN_ID_SOLANA,
  getEmitterAddressSolana,
  parseSequencesFromLogSolana,
  setDefaultWasm,
  tryNativeToHexString,
  postVaaSolanaWithRetry,
  importCoreWasm,
} from "@certusone/wormhole-sdk";
import axios from "axios";
import * as b from "byteify";

setDefaultWasm("node");
const WH_DEVNET_REST = "http://localhost:7071";
const SOLANA_CORE_BRIDGE_ADDRESS =
  "Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o";

class Orchestrator {
  program: Program<CoreGame>;
  wormhole: web3.PublicKey;

  whMessageKey: web3.Keypair;

  constructor(program: Program<CoreGame>, wormhole: web3.PublicKey) {
    this.program = program;
    this.wormhole = wormhole;
  }

  async registerNft(payer: Wallet, message_account: anchor.web3.Keypair) {
    const program = this.program;
    const wormhole = this.wormhole;

    // PDAs
    const [championPda] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("champion"), payer.publicKey.toBuffer()],
      program.programId
    );
    const wormholeConfig = deriveAddress([Buffer.from("Bridge")], wormhole);
    const wormholeFeeCollector = deriveAddress(
      [Buffer.from("fee_collector")],
      wormhole
    );

    // the emitter address is a PDA from the business-logic program that calls the sdk (not the sdk itself)
    const wormholeEmitter = deriveAddress(
      [Buffer.from("emitter")],
      program.programId
    );
    const wormholeSequence = deriveAddress(
      [Buffer.from("Sequence"), wormholeEmitter.toBytes()],
      wormhole
    );

    // these are all the accounts we need to make a registerNFT call
    let tx_accounts = {
      owner: payer.publicKey,
      // the PDA account for the champion's data
      championAccount: championPda,
      // the account where wormhole will store the message
      wormholeMessageAccount: message_account.publicKey,
      // system program
      systemProgram: web3.SystemProgram.programId,

      // wormhole accounts
      emitterAccount: wormholeEmitter,
      coreBridge: wormhole,
      wormholeConfig,
      wormholeFeeCollector,
      wormholeSequence,

      // system accounts
      clock: web3.SYSVAR_CLOCK_PUBKEY,
      rent: web3.SYSVAR_RENT_PUBKEY,
    };
    console.log(
      "Calling registerNFT with accounts:",
      Object.keys(tx_accounts).map(
        (key) => `${tx_accounts[key].toString()} ${key}`
      )
    );

    const requestUnitsIx = web3.ComputeBudgetProgram.requestUnits({
      units: 420690,
      additionalFee: 0,
    });

    return program.methods
      .registerNft()
      .accounts({
        ...tx_accounts,
      })
      .preInstructions([requestUnitsIx])
      .signers([message_account])
      .rpc();
  }

  async crossChainBattle(
    provider: anchor.AnchorProvider,
    payer: Wallet,
    championPda: PublicKey,
    vaaBytes: Buffer,
    emitterAddress: string
  ) {
    const { parse_vaa } = await importCoreWasm();
    const program = this.program;

    // tell wormhole via HTTP that we are about to confirm this VAA and need wormhole to make an account for it
    await postVaaSolanaWithRetry(
      provider.connection,
      async (tx) => {
        await provider.wallet.signTransaction(tx);
        return tx;
      },
      SOLANA_CORE_BRIDGE_ADDRESS,
      provider.wallet.publicKey.toString(),
      vaaBytes,
      10
    );

    const parsed_vaa = parse_vaa(vaaBytes);

    // wait for wormhole to make the account
    await sleep(5000);

    let processed_vaa_key = findProgramAddressSync(
      [
        Buffer.from(emitterAddress, "hex"),
        b.serializeUint16(parsed_vaa.emitter_chain),
        b.serializeUint64(parsed_vaa.sequence),
      ],
      program.programId
    )[0];

    //Create VAA Hash to use in core bridge key
    let buffer_array = [];
    buffer_array.push(b.serializeUint32(parsed_vaa.timestamp));
    buffer_array.push(b.serializeUint32(parsed_vaa.nonce));
    buffer_array.push(b.serializeUint16(parsed_vaa.emitter_chain));
    buffer_array.push(Uint8Array.from(parsed_vaa.emitter_address));
    buffer_array.push(b.serializeUint64(parsed_vaa.sequence));
    buffer_array.push(b.serializeUint8(parsed_vaa.consistency_level));
    buffer_array.push(Uint8Array.from(parsed_vaa.payload));
    const hash = keccak256(Buffer.concat(buffer_array));

    // this is the account that the guardians made for us to fetch our VAA from
    let core_bridge_vaa_key = findProgramAddressSync(
      [Buffer.from("PostedVAA"), hash],
      new anchor.web3.PublicKey(SOLANA_CORE_BRIDGE_ADDRESS)
    )[0];
    console.log("Core Bridge VAA Key: ", core_bridge_vaa_key.toString());

    // we use this account to specify what emitter address we expect the VAA to come from
    const wormholeEmitter = deriveAddress(
      [Buffer.from("emitter")],
      program.programId
    );

    // all the accounts that we'll pass into the battle contract call
    const accounts = {
      payer: payer.publicKey,
      systemProgram: web3.SystemProgram.programId,

      localChampionAccount: championPda,
      processedVaa: processed_vaa_key,

      coreBridgeVaa: core_bridge_vaa_key,
    };
    console.log(
      "Calling CrossChainBattle with accounts:",
      Object.keys(accounts).map((key) => `${accounts[key].toString()} ${key}`)
    );

    const requestUnitsIx = web3.ComputeBudgetProgram.requestUnits({
      units: 1500000,
      additionalFee: 0,
    });

    const signature = await program.methods
      .crossChainBattle(wormholeEmitter.toBuffer().toString("hex"), 1)
      .preInstructions([requestUnitsIx])
      .accounts(accounts)
      .rpc();

    await sleep(5000);

    const transaction = await program.provider.connection.getTransaction(
      signature,
      {
        commitment: "confirmed",
      }
    );
    console.log("Battle complete. Transaction data:", transaction);
  }
}

describe("solana", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  provider.opts.skipPreflight = true;
  // provider.opts.commitment = "confirmed";
  // provider.opts.preflightCommitment = "confirmed";
  anchor.setProvider(provider);

  const program = anchor.workspace.CoreGame as Program<CoreGame>;

  // provider.connection.onLogs(program.programId, logListener, "confirmed");

  const message_account = anchor.web3.Keypair.generate();
  const owner = provider.wallet;
  const orchestrator = new Orchestrator(program, CORE_BRIDGE_ADDRESS);

  it("allows registering NFTs and starting battles", async () => {
    // attempt to register an NFT via contract call
    const tx = await orchestrator.registerNft(owner, message_account);

    // Find the PDA that our champion was created at
    const [championPda] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("champion"), owner.publicKey.toBuffer()],
      program.programId
    );

    console.log(
      "You registered a champion with the following stats:",
      await program.account.championAccount.fetch(championPda)
    );

    console.log("Your transaction signature", tx);
    console.log(
      "Your registration transaction:",
      await program.provider.connection.getTransaction(tx, {
        commitment: "confirmed",
      })
    );

    // wait for wormhole to process the VAA and make it available over http
    await sleep(2000);

    // the logs from the previous transaction contain the sequence number. We can
    // use a wormhole sdk function to find it
    const seq = parseSequencesFromLogSolana(
      await program.provider.connection.getTransaction(tx, {
        commitment: "confirmed",
      })
    );

    // the emitter address is a PDA that is derived from our core_game contract address
    const emitterAddress = await getEmitterAddressSolana(
      program.programId.toString()
    );
    console.log("Emitter Address: ", emitterAddress);

    const url = `${WH_DEVNET_REST}/v1/signed_vaa/${CHAIN_ID_SOLANA}/${emitterAddress}/${seq}`;
    console.log("Attempting to fetch vaa from ", url);

    // fetch the vaa via http
    let response = await axios.get(url);

    // get the vaa as bytes and convert to a buffer for easier processing
    let vaa = response.data.vaaBytes;
    let vaaBytes = Buffer.from(vaa, "base64");

    // attempt to battle our champion against itself
    await orchestrator.crossChainBattle(
      provider,
      owner,
      championPda,
      vaaBytes,
      emitterAddress
    );
  });
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

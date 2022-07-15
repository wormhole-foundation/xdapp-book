import * as anchor from "@project-serum/anchor";
import { web3 } from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import {
  deriveAddress,
  getPdaAssociatedTokenAddress,
  makeReadOnlyAccountMeta,
  makeWritableAccountMeta,
} from "../tests/helpers/utils";
import { CoreGame } from "../target/types/core_game";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { CORE_BRIDGE_ADDRESS, TOKEN_BRIDGE_ADDRESS } from "../tests/helpers/consts";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  CHAIN_ID_SOLANA,
  getEmitterAddressSolana,
  parseSequencesFromLogSolana,
  setDefaultWasm,
  tryNativeToHexString,
} from "@certusone/wormhole-sdk";
import axios from "axios";
import * as fs from "fs";

setDefaultWasm("node");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const logListener = (
  provider: anchor.AnchorProvider,
  program: Program<CoreGame>
) => {
  return async (logs, ctx) => {
    console.log(logs);
    console.log(ctx);

    const transaction = await provider.connection.getTransaction(
      logs.signature,
      {
        commitment: "confirmed",
      }
    );

    const seq = parseSequencesFromLogSolana(transaction);
    const emitterAddress = await getEmitterAddressSolana(
      program.programId.toString()
    );
    const WH_DEVNET_REST = "http://localhost:7071";
    const url = `${WH_DEVNET_REST}/v1/signed_vaa/${CHAIN_ID_SOLANA}/${emitterAddress}/${seq}`;
    console.log("url", url);

    let response = await axios.get(url);

    console.log(JSON.stringify(response));

  };
};

const main = async () => {
  // const provider = anchor.AnchorProvider.env();
  const connection = new anchor.web3.Connection("http://localhost:8899", "confirmed");
  const payer = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync("./tests/test_orchestrator_keypair.json").toString())));
  const wallet = new anchor.Wallet(payer);
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  anchor.setProvider(provider);

  const program = anchor.workspace.CoreGame as Program<CoreGame>;

  provider.connection.onLogs("all", logListener)
  console.log("Listening");

  while (true) {
    await sleep(1000);
  }
};

main()

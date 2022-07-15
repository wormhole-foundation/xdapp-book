import { getOriginalAssetSol, tryHexToNativeString } from "@certusone/wormhole-sdk";
import { BN, Program, web3 } from "@project-serum/anchor";
import { AnchorContributor } from "../../target/types/anchor_contributor";
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { deriveAddress, getPdaAssociatedTokenAddress, makeReadOnlyAccountMeta, makeWritableAccountMeta } from "./utils";
import { PostVaaMethod } from "./types";
import { serializeUint16 } from "byteify";
import { hashVaaPayload } from "./wormhole";

export class IccoContributor {
  program: Program<AnchorContributor>;
  wormhole: web3.PublicKey;
  tokenBridge: web3.PublicKey;
  postVaaWithRetry: PostVaaMethod;

  whMessageKey: web3.Keypair;
  custodian: web3.PublicKey;

  constructor(
    program: Program<AnchorContributor>,
    wormhole: web3.PublicKey,
    tokenBridge: web3.PublicKey,
    postVaaWithRetry: PostVaaMethod
  ) {
    this.program = program;
    this.wormhole = wormhole;
    this.tokenBridge = tokenBridge;
    this.postVaaWithRetry = postVaaWithRetry;
    this.custodian = this.deriveCustodianAccount();
  }

  async createCustodian(payer: web3.Keypair) {
    const program = this.program;

    return program.methods
      .createCustodian()
      .accounts({
        payer: payer.publicKey,
        custodian: this.custodian,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async initSale(payer: web3.Keypair, initSaleVaa: Buffer, saleTokenMint: web3.PublicKey): Promise<string> {
    const program = this.program;

    const custodian = this.custodian;

    // first post signed vaa to wormhole
    await this.postVaa(payer, initSaleVaa);
    const coreBridgeVaa = this.deriveSignedVaaAccount(initSaleVaa);

    const saleId = await parseSaleId(initSaleVaa);
    const sale = this.deriveSaleAccount(saleId);
    const custodianSaleTokenAcct = await getPdaAssociatedTokenAddress(saleTokenMint, custodian);

    return program.methods
      .initSale()
      .accounts({
        custodian,
        sale,
        coreBridgeVaa,
        saleTokenMint,
        custodianSaleTokenAcct,
        payer: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async contribute(
    payer: web3.Keypair,
    saleId: Buffer,
    tokenIndex: number,
    amount: BN,
    kycSignature: Buffer
  ): Promise<string> {
    // first find mint
    const state = await this.getSale(saleId);

    const totals: any = state.totals;
    const found = totals.find((item) => item.tokenIndex == tokenIndex);
    if (found == undefined) {
      throw "tokenIndex not found";
    }

    const mint = found.mint;

    // now prepare instruction
    const program = this.program;

    const custodian = this.custodian;

    const buyer = this.deriveBuyerAccount(saleId, payer.publicKey);
    const sale = this.deriveSaleAccount(saleId);
    const buyerTokenAcct = await getAssociatedTokenAddress(mint, payer.publicKey);
    const custodianTokenAcct = await getPdaAssociatedTokenAddress(mint, custodian);

    return program.methods
      .contribute(amount, kycSignature)
      .accounts({
        custodian,
        sale,
        buyer,
        owner: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        buyerTokenAcct,
        custodianTokenAcct,
      })
      .signers([payer])
      .rpc();
  }

  async attestContributions(payer: web3.Keypair, saleId: Buffer) {
    const program = this.program;
    const wormhole = this.wormhole;

    // Accounts
    const sale = this.deriveSaleAccount(saleId);
    const wormholeConfig = deriveAddress([Buffer.from("Bridge")], wormhole);
    const wormholeFeeCollector = deriveAddress([Buffer.from("fee_collector")], wormhole);

    // contributor is the emitter
    const wormholeEmitter = deriveAddress([Buffer.from("emitter")], program.programId);
    const wormholeSequence = deriveAddress([Buffer.from("Sequence"), wormholeEmitter.toBytes()], wormhole);

    const wormholeMessage = this.deriveAttestContributionsMessageAccount(saleId);

    return program.methods
      .attestContributions()
      .accounts({
        sale,
        payer: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        wormhole,
        wormholeConfig,
        wormholeFeeCollector,
        wormholeEmitter,
        wormholeSequence,
        wormholeMessage,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([payer])
      .rpc();
  }

  async sealSale(payer: web3.Keypair, saleSealedVaa: Buffer): Promise<string> {
    const saleId = await parseSaleId(saleSealedVaa);
    const saleState = await this.getSale(saleId);
    const saleTokenMint = saleState.saleTokenMint;

    const program = this.program;

    const custodian = this.custodian;

    // first post signed vaa to wormhole
    await this.postVaa(payer, saleSealedVaa);
    const coreBridgeVaa = this.deriveSignedVaaAccount(saleSealedVaa);

    const sale = this.deriveSaleAccount(saleId);
    const custodianSaleTokenAcct = await getPdaAssociatedTokenAddress(saleTokenMint, custodian);

    const totals: any = saleState.totals;
    const mints = totals.map((total) => total.mint);

    const remainingAccounts: web3.AccountMeta[] = [];

    // push custodian token accounts
    const custodianTokenAccounts = await Promise.all(
      mints.map(async (mint) => getPdaAssociatedTokenAddress(mint, custodian))
    );
    remainingAccounts.push(
      ...custodianTokenAccounts.map((acct) => {
        return makeReadOnlyAccountMeta(acct);
      })
    );

    return program.methods
      .sealSale()
      .accounts({
        custodian,
        sale,
        coreBridgeVaa,
        custodianSaleTokenAcct,
        systemProgram: web3.SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .rpc();
  }

  async bridgeSealedContribution(payer: web3.Keypair, saleId: Buffer, acceptedMint: web3.PublicKey) {
    const program = this.program;
    const wormhole = this.wormhole;
    const tokenBridge = this.tokenBridge;

    const custodian = this.custodian;
    const custodianTokenAcct = await getPdaAssociatedTokenAddress(acceptedMint, custodian);

    const sale = this.deriveSaleAccount(saleId);

    // need to check whether token bridge minted spl
    const tokenMintSigner = deriveAddress([Buffer.from("mint_signer")], tokenBridge);

    const custodyOrWrappedMeta = await (async () => {
      const mintInfo = await getMint(program.provider.connection, acceptedMint);
      if (mintInfo.mintAuthority == tokenMintSigner) {
        //First derive the Wrapped Mint Key
        const nativeInfo = await getOriginalAssetSol(
          program.provider.connection,
          tokenBridge.toString(),
          acceptedMint.toString()
        );
        const wrappedMintKey = deriveAddress(
          [Buffer.from("wrapped"), serializeUint16(nativeInfo.chainId as number), acceptedMint.toBytes()],
          tokenBridge
        );
        //Then derive the Wrapped Meta Key
        return deriveAddress([Buffer.from("meta"), wrappedMintKey.toBytes()], tokenBridge);
      } else {
        return deriveAddress([acceptedMint.toBytes()], tokenBridge);
      }
    })();

    // wormhole
    const wormholeConfig = deriveAddress([Buffer.from("Bridge")], wormhole);
    const wormholeFeeCollector = deriveAddress([Buffer.from("fee_collector")], wormhole);

    // token bridge emits vaa
    const wormholeEmitter = deriveAddress([Buffer.from("emitter")], tokenBridge);
    const wormholeSequence = deriveAddress([Buffer.from("Sequence"), wormholeEmitter.toBytes()], wormhole);

    // token bridge
    const authoritySigner = deriveAddress([Buffer.from("authority_signer")], tokenBridge);
    const tokenBridgeConfig = deriveAddress([Buffer.from("config")], tokenBridge);
    const custodySigner = deriveAddress([Buffer.from("custody_signer")], tokenBridge);

    const wormholeMessage = this.deriveSealedTransferMessageAccount(saleId, acceptedMint);

    const requestUnitsIx = web3.ComputeBudgetProgram.requestUnits({
      units: 420690,
      additionalFee: 0,
    });
    return program.methods
      .bridgeSealedContribution()
      .accounts({
        custodian,
        sale,
        custodianTokenAcct,
        acceptedMint,
        payer: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenBridge,
        custodyOrWrappedMeta,
        custodySigner,
        tokenMintSigner,
        authoritySigner,
        tokenBridgeConfig,
        wormhole,
        wormholeConfig,
        wormholeFeeCollector,
        wormholeEmitter,
        wormholeSequence,
        wormholeMessage,
        clock: web3.SYSVAR_CLOCK_PUBKEY,
        rent: web3.SYSVAR_RENT_PUBKEY,
      })
      .preInstructions([requestUnitsIx])
      .signers([payer])
      .rpc();
  }

  async abortSale(payer: web3.Keypair, saleAbortedVaa: Buffer): Promise<string> {
    const program = this.program;

    const custodian = this.custodian;

    // first post signed vaa to wormhole
    await this.postVaa(payer, saleAbortedVaa);
    const coreBridgeVaa = this.deriveSignedVaaAccount(saleAbortedVaa);

    const saleId = await parseSaleId(saleAbortedVaa);
    const sale = this.deriveSaleAccount(saleId);

    return program.methods
      .abortSale()
      .accounts({
        custodian,
        sale,
        coreBridgeVaa,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
  }

  async claimRefunds(payer: web3.Keypair, saleId: Buffer): Promise<string> {
    const saleState = await this.getSale(saleId);
    const totals: any = saleState.totals;
    const mints = totals.map((total) => total.mint);

    const program = this.program;

    const custodian = this.custodian;

    const buyer = this.deriveBuyerAccount(saleId, payer.publicKey);
    const sale = this.deriveSaleAccount(saleId);

    const remainingAccounts: web3.AccountMeta[] = [];

    // push custodian token accounts
    const custodianTokenAccounts = await Promise.all(
      mints.map(async (mint) => getPdaAssociatedTokenAddress(mint, custodian))
    );
    remainingAccounts.push(
      ...custodianTokenAccounts.map((acct) => {
        return makeWritableAccountMeta(acct);
      })
    );

    // next buyers
    const buyerTokenAccounts = await Promise.all(
      mints.map(async (mint) => getAssociatedTokenAddress(mint, payer.publicKey))
    );
    remainingAccounts.push(
      ...buyerTokenAccounts.map((acct) => {
        return makeWritableAccountMeta(acct);
      })
    );

    return program.methods
      .claimRefunds()
      .accounts({
        custodian,
        sale,
        buyer,
        owner: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([payer])
      .remainingAccounts(remainingAccounts)
      .rpc();
  }

  async claimAllocation(payer: web3.Keypair, saleId: Buffer): Promise<string> {
    const saleState = await this.getSale(saleId);
    const saleTokenMint = saleState.saleTokenMint;

    const program = this.program;

    const custodian = this.custodian;

    const buyer = this.deriveBuyerAccount(saleId, payer.publicKey);
    const sale = this.deriveSaleAccount(saleId);

    const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      payer,
      saleTokenMint,
      payer.publicKey
    );
    const buyerSaleTokenAcct = buyerTokenAccount.address;
    const custodianSaleTokenAcct = await getPdaAssociatedTokenAddress(saleTokenMint, custodian);

    return program.methods
      .claimAllocation()
      .accounts({
        custodian,
        sale,
        buyer,
        buyerSaleTokenAcct,
        custodianSaleTokenAcct,
        owner: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();
  }

  async claimExcesses(payer: web3.Keypair, saleId: Buffer): Promise<string> {
    const saleState = await this.getSale(saleId);
    const totals: any = saleState.totals;
    const mints = totals.map((total) => total.mint);

    const program = this.program;

    const custodian = this.custodian;

    const buyer = this.deriveBuyerAccount(saleId, payer.publicKey);
    const sale = this.deriveSaleAccount(saleId);

    const remainingAccounts: web3.AccountMeta[] = [];

    // push custodian token accounts
    const custodianTokenAccounts = await Promise.all(
      mints.map(async (mint) => getPdaAssociatedTokenAddress(mint, custodian))
    );
    remainingAccounts.push(
      ...custodianTokenAccounts.map((acct) => {
        return makeWritableAccountMeta(acct);
      })
    );

    // next buyers
    const buyerTokenAccounts = await Promise.all(
      mints.map(async (mint) => getAssociatedTokenAddress(mint, payer.publicKey))
    );
    remainingAccounts.push(
      ...buyerTokenAccounts.map((acct) => {
        return makeWritableAccountMeta(acct);
      })
    );

    return program.methods
      .claimExcesses()
      .accounts({
        custodian,
        sale,
        buyer,
        owner: payer.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([payer])
      .remainingAccounts(remainingAccounts)
      .rpc();
  }

  async getCustodian() {
    return this.program.account.custodian.fetch(this.custodian);
  }

  async getSale(saleId: Buffer) {
    return this.program.account.sale.fetch(this.deriveSaleAccount(saleId));
  }

  async getBuyer(saleId: Buffer, buyer: web3.PublicKey) {
    return this.program.account.buyer.fetch(this.deriveBuyerAccount(saleId, buyer));
  }

  async postVaa(payer: web3.Keypair, signedVaa: Buffer): Promise<void> {
    //return postVaa(this.program.provider.connection, payer, this.wormhole, signedVaa);
    await this.postVaaWithRetry(
      this.program.provider.connection,
      async (tx) => {
        tx.partialSign(payer);
        return tx;
      },
      this.wormhole.toString(),
      payer.publicKey.toString(),
      signedVaa,
      10
    );
  }

  deriveSealedTransferMessageAccount(saleId: Buffer, mint: web3.PublicKey): web3.PublicKey {
    return deriveAddress([Buffer.from("bridge-sealed"), saleId, mint.toBytes()], this.program.programId);
  }

  deriveAttestContributionsMessageAccount(saleId: Buffer): web3.PublicKey {
    return deriveAddress([Buffer.from("attest-contributions"), saleId], this.program.programId);
  }

  deriveSaleAccount(saleId: Buffer): web3.PublicKey {
    return deriveAddress([Buffer.from("icco-sale"), saleId], this.program.programId);
  }

  deriveBuyerAccount(saleId: Buffer, buyer: web3.PublicKey): web3.PublicKey {
    return deriveAddress([Buffer.from("icco-buyer"), saleId, buyer.toBuffer()], this.program.programId);
  }

  deriveSignedVaaAccount(signedVaa: Buffer): web3.PublicKey {
    const hash = hashVaaPayload(signedVaa);
    return deriveAddress([Buffer.from("PostedVAA"), hash], this.wormhole);
  }

  deriveCustodianAccount(): web3.PublicKey {
    return deriveAddress([Buffer.from("icco-custodian")], this.program.programId);
  }
}

async function parseSaleId(iccoVaa: Buffer): Promise<Buffer> {
  //const { parse_vaa } = await importCoreWasm();
  const numSigners = iccoVaa[5];
  const payloadStart = 57 + 66 * numSigners;
  return iccoVaa.subarray(payloadStart + 1, payloadStart + 33);
}

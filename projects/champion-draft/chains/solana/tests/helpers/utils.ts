import { web3, BN } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { tryHexToNativeString, CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { BigNumber, BigNumberish } from "ethers";

export function toBigNumberHex(value: BigNumberish, numBytes: number): string {
  return BigNumber.from(value)
    .toHexString()
    .substring(2)
    .padStart(numBytes * 2, "0");
}

export async function wait(timeInSeconds: number): Promise<void> {
  await new Promise((r) => setTimeout(r, timeInSeconds * 1000));
}

export async function getBlockTime(connection: web3.Connection): Promise<number> {
  const slot = await connection.getSlot();
  return connection.getBlockTime(slot);
}

export async function getSplBalance(connection: web3.Connection, mint: web3.PublicKey, owner: web3.PublicKey) {
  const tokenAccount = await getAssociatedTokenAddress(mint, owner);
  const account = await getAccount(connection, tokenAccount);
  return new BN(account.amount.toString());
}

export async function getPdaSplBalance(connection: web3.Connection, mint: web3.PublicKey, owner: web3.PublicKey) {
  const tokenAccount = await getPdaAssociatedTokenAddress(mint, owner);
  const account = await getAccount(connection, tokenAccount);
  return new BN(account.amount.toString());
}

export function hexToPublicKey(hexlified: string): web3.PublicKey {
  return new web3.PublicKey(tryHexToNativeString(hexlified, CHAIN_ID_SOLANA));
}

export async function getPdaAssociatedTokenAddress(mint: web3.PublicKey, pda: web3.PublicKey): Promise<web3.PublicKey> {
  return getAssociatedTokenAddress(mint, pda, true);
}

export function makeWritableAccountMeta(pubkey: web3.PublicKey): web3.AccountMeta {
  return {
    pubkey,
    isWritable: true,
    isSigner: false,
  };
}

export function makeReadOnlyAccountMeta(pubkey: web3.PublicKey): web3.AccountMeta {
  return {
    pubkey,
    isWritable: false,
    isSigner: false,
  };
}

export function deriveAddress(seeds: (Buffer | Uint8Array)[], program: web3.PublicKey): web3.PublicKey {
  return findProgramAddressSync(seeds, program)[0];
}

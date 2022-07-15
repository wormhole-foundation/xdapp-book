import { web3 } from "@project-serum/anchor";

export type PostVaaMethod = (
  connection: web3.Connection,
  signTransaction: (transaction: web3.Transaction) => Promise<web3.Transaction>,
  bridge_id: string,
  payer: string,
  vaa: Buffer,
  maxRetries: number
) => Promise<void>;

export interface SolanaAcceptedToken {
  index: number; // uint8
  address: string; // 32 bytes
}

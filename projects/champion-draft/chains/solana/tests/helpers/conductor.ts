import { web3 } from "@project-serum/anchor";
import { CHAIN_ID_ETH, CHAIN_ID_SOLANA, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { createMint, mintTo } from "@solana/spl-token";
import { BigNumber, BigNumberish } from "ethers";

import { getPdaAssociatedTokenAddress, toBigNumberHex } from "./utils";
import { signAndEncodeVaa } from "./wormhole";
import { BN } from "bn.js";
import { SolanaAcceptedToken } from "./types";

// sale struct info
export const MAX_ACCEPTED_TOKENS = 8;
const NUM_BYTES_ACCEPTED_TOKEN = 33;
const NUM_BYTES_ALLOCATION = 65;

export class DummyConductor {
  chainId: number;
  address: Buffer;

  saleId: number;
  wormholeSequence: number;

  saleStart: number;
  saleEnd: number;
  saleUnlock: number;

  initSaleVaa: Buffer;

  saleTokenOnSolana: string;
  acceptedTokens: SolanaAcceptedToken[];
  allocations: Allocation[];

  constructor(chainId: number, address: string) {
    this.chainId = chainId;
    this.address = Buffer.from(address, "hex");

    this.saleId = 0;
    this.wormholeSequence = 0;

    this.saleStart = 0;
    this.saleEnd = 0;
    this.saleUnlock = 0;

    this.acceptedTokens = [];
    this.allocations = [];
  }

  async attestSaleToken(connection: web3.Connection, payer: web3.Keypair): Promise<void> {
    const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, this.nativeTokenDecimals);
    this.saleTokenOnSolana = mint.toString();
    return;
  }

  async redeemAllocationsOnSolana(
    connection: web3.Connection,
    payer: web3.Keypair,
    custodian: web3.PublicKey
  ): Promise<void> {
    const mint = new web3.PublicKey(this.saleTokenOnSolana);
    const custodianTokenAcct = await getPdaAssociatedTokenAddress(mint, custodian);
    const amount = this.allocations.map((item) => new BN(item.allocation)).reduce((prev, curr) => prev.add(curr));

    await mintTo(
      connection,
      payer,
      mint,
      custodianTokenAcct,
      payer,
      BigInt(amount.toString()) // 20,000,000,000 lamports
    );
    return;
  }

  getSaleTokenOnSolana(): web3.PublicKey {
    return new web3.PublicKey(this.saleTokenOnSolana);
  }

  async createAcceptedTokens(connection: web3.Connection, payer: web3.Keypair): Promise<SolanaAcceptedToken[]> {
    const tokenIndices = [2, 3, 5, 8, 13, 21, 34, 55];

    for (let i = 0; i < MAX_ACCEPTED_TOKENS; ++i) {
      // just make everything the same number of decimals (9)
      const mint = await createMint(connection, payer, payer.publicKey, payer.publicKey, 9);
      this.acceptedTokens.push(makeSolanaAcceptedToken(tokenIndices[i], mint.toString()));
    }
    return this.acceptedTokens;
  }

  getSaleId(): Buffer {
    return Buffer.from(toBigNumberHex(this.saleId, 32), "hex");
  }

  createSale(
    startTime: number,
    duration: number,
    associatedSaleTokenAddress: web3.PublicKey,
    lockPeriod: number
  ): Buffer {
    // uptick saleId for every new sale
    ++this.saleId;
    ++this.wormholeSequence;

    // set up sale time based on block time
    this.saleStart = startTime;
    this.saleEnd = this.saleStart + duration;
    this.saleUnlock = this.saleEnd + lockPeriod;

    this.initSaleVaa = signAndEncodeVaa(
      startTime,
      this.nonce,
      this.chainId,
      this.address,
      this.wormholeSequence,
      encodeSaleInit(
        this.saleId,
        tryNativeToHexString(associatedSaleTokenAddress.toString(), CHAIN_ID_SOLANA),
        this.tokenChain,
        this.tokenDecimals,
        this.saleStart,
        this.saleEnd,
        this.acceptedTokens,
        this.recipient,
        this.kycAuthority,
        this.saleUnlock
      )
    );
    return this.initSaleVaa;
  }

  getAllocationMultiplier(): string {
    const decimalDifference = this.tokenDecimals - this.nativeTokenDecimals;
    return BigNumber.from("10").pow(decimalDifference).toString();
  }

  sealSale(blockTime: number, contributions: Map<number, string[]>): Buffer {
    ++this.wormholeSequence;
    this.allocations = [];

    const allocationMultiplier = this.getAllocationMultiplier();

    // make up allocations and excess contributions
    const excessContributionDivisor = BigNumber.from("5");

    const acceptedTokens = this.acceptedTokens;
    for (let i = 0; i < acceptedTokens.length; ++i) {
      const tokenIndex = acceptedTokens[i].index;
      const contributionSubset = contributions.get(tokenIndex);
      if (contributionSubset === undefined) {
        this.allocations.push(makeAllocation(tokenIndex, "0", "0"));
      } else {
        const total = contributionSubset.map((x) => BigNumber.from(x)).reduce((prev, curr) => prev.add(curr));
        const excessContribution = total.div(excessContributionDivisor).toString();

        const allocation = BigNumber.from(this.expectedAllocations[i]).mul(allocationMultiplier).toString();
        this.allocations.push(makeAllocation(tokenIndex, allocation, excessContribution));
      }
    }
    return signAndEncodeVaa(
      blockTime,
      this.nonce,
      this.chainId,
      this.address,
      this.wormholeSequence,
      encodeSaleSealed(this.saleId, this.allocations)
    );
  }

  abortSale(blockTime: number): Buffer {
    ++this.wormholeSequence;
    return signAndEncodeVaa(
      blockTime,
      this.nonce,
      this.chainId,
      this.address,
      this.wormholeSequence,
      encodeSaleAborted(this.saleId)
    );
  }

  // sale parameters that won't change for the test
  //associatedTokenAddress = "00000000000000000000000083752ecafebf4707258dedffbd9c7443148169db";
  tokenChain = CHAIN_ID_ETH as number;
  tokenDecimals = 18;
  nativeTokenDecimals = 7;
  recipient = tryNativeToHexString("0x22d491bde2303f2f43325b2108d26f1eaba1e32b", CHAIN_ID_ETH);
  kycAuthority = "1df62f291b2e969fb0849d99d9ce41e2f137006e";

  // we won't use all of these, but these are purely to verify decimal shift
  expectedAllocations = [
    "1000000000",
    "1000000000",
    "2000000000",
    "3000000000",
    "5000000000",
    "8000000000",
    "13000000000",
    "21000000000",
  ];

  // wormhole nonce
  nonce = 0;
}

function makeSolanaAcceptedToken(index: number, pubkey: string): SolanaAcceptedToken {
  return { index, address: tryNativeToHexString(pubkey, CHAIN_ID_SOLANA) };
}

function makeAllocation(index: number, allocation: string, excessContribution: string): Allocation {
  return { index, allocation, excessContribution };
}

export function encodeAcceptedTokens(acceptedTokens: SolanaAcceptedToken[]): Buffer {
  const n = acceptedTokens.length;
  const encoded = Buffer.alloc(NUM_BYTES_ACCEPTED_TOKEN * n);
  for (let i = 0; i < n; ++i) {
    const token = acceptedTokens[i];
    const start = i * NUM_BYTES_ACCEPTED_TOKEN;
    encoded.writeUint8(token.index, start);
    encoded.write(token.address, start + 1, "hex");
  }
  return encoded;
}

export function encodeSaleInit(
  saleId: number,
  associatedTokenAddress: string, // 32 bytes
  tokenChain: number,
  tokenDecimals: number,
  saleStart: number,
  saleEnd: number,
  acceptedTokens: SolanaAcceptedToken[], // 33 * n_tokens
  recipient: string, // 32 bytes
  kycAuthority: string, // 20 bytes (ethereum address)
  saleUnlock: number
): Buffer {
  const numTokens = acceptedTokens.length;
  const encoded = Buffer.alloc(217 + numTokens * NUM_BYTES_ACCEPTED_TOKEN);

  encoded.writeUInt8(5, 0); // initSale payload for solana = 5
  encoded.write(toBigNumberHex(saleId, 32), 1, "hex");
  encoded.write(associatedTokenAddress, 33, "hex");
  encoded.writeUint16BE(tokenChain, 65);
  encoded.writeUint8(tokenDecimals, 67);
  encoded.write(toBigNumberHex(saleStart, 32), 68, "hex");
  encoded.write(toBigNumberHex(saleEnd, 32), 100, "hex");
  encoded.writeUInt8(numTokens, 132);
  encoded.write(encodeAcceptedTokens(acceptedTokens).toString("hex"), 133, "hex");

  const recipientIndex = 133 + numTokens * NUM_BYTES_ACCEPTED_TOKEN;
  encoded.write(recipient, recipientIndex, "hex");
  encoded.write(kycAuthority, recipientIndex + 32, "hex");
  encoded.write(toBigNumberHex(saleUnlock, 32), recipientIndex + 52, "hex");
  return encoded;
}

export interface Allocation {
  index: number;
  allocation: string; // big number, uint256
  excessContribution: string; // big number, uint256
}

export function encodeAllocations(allocations: Allocation[]): Buffer {
  const n = allocations.length;
  const encoded = Buffer.alloc(NUM_BYTES_ALLOCATION * n);
  for (let i = 0; i < n; ++i) {
    const item = allocations[i];
    const start = i * NUM_BYTES_ALLOCATION;
    encoded.writeUint8(item.index, start);
    encoded.write(toBigNumberHex(item.allocation, 32), start + 1, "hex");
    encoded.write(toBigNumberHex(item.excessContribution, 32), start + 33, "hex");
  }
  return encoded;
}

export function encodeSaleSealed(
  saleId: number,
  allocations: Allocation[] // 65 * n_allocations
): Buffer {
  const headerLen = 33;
  const numAllocations = allocations.length;
  const encoded = Buffer.alloc(headerLen + 1 + numAllocations * NUM_BYTES_ALLOCATION);

  encoded.writeUInt8(3, 0); // saleSealed payload = 3
  encoded.write(toBigNumberHex(saleId, 32), 1, "hex");
  encoded.writeUint8(numAllocations, headerLen);
  encoded.write(encodeAllocations(allocations).toString("hex"), headerLen + 1, "hex");

  return encoded;
}

export function encodeSaleAborted(saleId: number): Buffer {
  const encoded = Buffer.alloc(33);
  encoded.writeUInt8(4, 0); // saleSealed payload = 4
  encoded.write(toBigNumberHex(saleId, 32), 1, "hex");
  return encoded;
}

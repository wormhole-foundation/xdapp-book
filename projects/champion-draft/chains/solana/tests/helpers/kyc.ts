import { CHAIN_ID_SOLANA, tryNativeToHexString } from "@certusone/wormhole-sdk";
import { web3, BN } from "@project-serum/anchor";
import { soliditySha3 } from "web3-utils";
import { IccoContributor } from "./contributor";
import { toBigNumberHex } from "./utils";

const elliptic = require("elliptic");

export class KycAuthority {
  privateKey: Buffer;
  conductorAddress: string;
  contributor: IccoContributor;

  constructor(
    privateKey: string,
    conductorAddress: string,
    contributor: IccoContributor
  ) {
    this.privateKey = Buffer.from(privateKey, "hex");
    this.conductorAddress = conductorAddress;
    this.contributor = contributor;
  }

  async getSale(saleId: Buffer) {
    return this.contributor.getSale(saleId);
  }

  async getBuyer(saleId: Buffer, buyer: web3.PublicKey) {
    return this.contributor.getBuyer(saleId, buyer);
  }

  async fetchBuyerTotalContribution(
    saleId: Buffer,
    tokenIndex: number,
    buyer: web3.PublicKey
  ): Promise<BN> {
    try {
      const sale = await this.getSale(saleId);
      const totals: any = sale.totals;

      const idx = totals.findIndex((item) => item.tokenIndex == tokenIndex);
      if (idx < 0) {
        throw Error("tokenIndex not found");
      }

      const state = await this.getBuyer(saleId, buyer);
      return state.contributions[idx].amount;
    } catch (e) {
      if (e.toString().includes("Account does not exist")) {
        return new BN("0");
      }
      throw e;
    }
  }

  async signContribution(
    saleId: Buffer,
    tokenIndex: number,
    amount: BN,
    buyer: web3.PublicKey
  ) {
    const totalContribution = await this.fetchBuyerTotalContribution(
      saleId,
      tokenIndex,
      buyer
    );

    const body = Buffer.alloc(6 * 32, 0);
    body.write(this.conductorAddress, 0, "hex");
    body.write(saleId.toString("hex"), 32, "hex");
    body.write(toBigNumberHex(tokenIndex, 32), 2 * 32, "hex");
    body.write(toBigNumberHex(amount.toString(), 32), 3 * 32, "hex");
    body.write(
      tryNativeToHexString(buyer.toString(), CHAIN_ID_SOLANA),
      4 * 32,
      "hex"
    );
    body.write(toBigNumberHex(totalContribution.toString(), 32), 5 * 32, "hex");

    const hash = soliditySha3("0x" + body.toString("hex"));

    const ec = new elliptic.ec("secp256k1");
    const key = ec.keyFromPrivate(this.privateKey);
    const signature = key.sign(hash.substring(2), { canonical: true });

    const packed = Buffer.alloc(65);
    packed.write(signature.r.toString(16).padStart(64, "0"), 0, "hex");
    packed.write(signature.s.toString(16).padStart(64, "0"), 32, "hex");
    packed.writeUInt8(signature.recoveryParam, 64);
    return packed;
  }
}

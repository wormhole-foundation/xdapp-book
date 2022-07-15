import { web3 } from "@project-serum/anchor";
import keccak256 from "keccak256";
import { soliditySha3 } from "web3-utils";
import { postVaaSolanaWithRetry } from "@certusone/wormhole-sdk";

const elliptic = require("elliptic");

/*
export async function postVaa(
  connection: web3.Connection,
  payer: web3.Keypair,
  wormhole: web3.PublicKey,
  signedVaa: Buffer
): Promise<void> {
  await postVaaSolanaWithRetry(
    connection,
    async (tx) => {
      tx.partialSign(payer);
      return tx;
    },
    wormhole.toString(),
    payer.publicKey.toString(),
    signedVaa,
    10
  );
}*/

export function signAndEncodeVaa(
  timestamp: number,
  nonce: number,
  emitterChainId: number,
  emitterAddress: Buffer,
  sequence: number,
  data: Buffer
): Buffer {
  if (emitterAddress.length != 32) {
    throw Error("emitterAddress != 32 bytes");
  }

  // wormhole initialized with only one guardian in devnet
  const signers = ["cfb12303a19cde580bb4dd771639b0d26bc68353645571a8cff516ab2ee113a0"];

  const sigStart = 6;
  const numSigners = signers.length;
  const sigLength = 66;
  const bodyStart = sigStart + sigLength * numSigners;
  const bodyHeaderLength = 51;
  const vm = Buffer.alloc(bodyStart + bodyHeaderLength + data.length);

  // header
  const guardianSetIndex = 0;

  vm.writeUInt8(1, 0);
  vm.writeUInt32BE(guardianSetIndex, 1);
  vm.writeUInt8(numSigners, 5);

  // encode body with arbitrary consistency level
  const consistencyLevel = 1;

  vm.writeUInt32BE(timestamp, bodyStart);
  vm.writeUInt32BE(nonce, bodyStart + 4);
  vm.writeUInt16BE(emitterChainId, bodyStart + 8);
  vm.write(emitterAddress.toString("hex"), bodyStart + 10, "hex");
  vm.writeBigUInt64BE(BigInt(sequence), bodyStart + 42);
  vm.writeUInt8(consistencyLevel, bodyStart + 50);
  vm.write(data.toString("hex"), bodyStart + bodyHeaderLength, "hex");

  // signatures
  const body = vm.subarray(bodyStart).toString("hex");
  const hash = soliditySha3(soliditySha3("0x" + body)!)!.substring(2);

  for (let i = 0; i < numSigners; ++i) {
    const ec = new elliptic.ec("secp256k1");
    const key = ec.keyFromPrivate(signers[i]);
    const signature = key.sign(hash, { canonical: true });

    const start = sigStart + i * sigLength;
    vm.writeUInt8(i, start);
    vm.write(signature.r.toString(16).padStart(64, "0"), start + 1, "hex");
    vm.write(signature.s.toString(16).padStart(64, "0"), start + 33, "hex");
    vm.writeUInt8(signature.recoveryParam, start + 65);
  }

  return vm;
}

export function hashVaaPayload(signedVaa: Buffer): Buffer {
  const sigStart = 6;
  const numSigners = signedVaa[5];
  const sigLength = 66;
  const bodyStart = sigStart + sigLength * numSigners;
  return keccak256(signedVaa.subarray(bodyStart));
}

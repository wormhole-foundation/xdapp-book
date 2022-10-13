import * as wh from "@certusone/wormhole-sdk";

export function assertInt(x: any, fieldName?: string): number {
  if (!Number.isInteger(x)) {
    const e = new Error(`Expected field to be integer, found ${x}`) as any;
    e.fieldName = fieldName;
    throw e;
  }
  return x as number;
}

export function assertArray<T>(x: any, fieldName?: string): T[] {
  if (!Array.isArray(x)) {
    const e = new Error(`Expected field to be array, found ${x}`) as any;
    e.fieldName = fieldName;
    throw e;
  }
  return x as T[];
}

export function assertBool(x: any, fieldName?: string): boolean {
  if (x !== false && x !== true) {
    const e = new Error(`Expected field to be boolean, found ${x}`) as any;
    e.fieldName = fieldName;
    throw e;
  }
  return x as boolean;
}

export function nnull<T>(x: T | undefined | null, errMsg?: string): T {
  if (x === undefined || x === null) {
    throw new Error("Found unexpected undefined or null. " + errMsg);
  }
  return x;
}

export interface BaseVAA {
  version: number;
  guardianSetIndex: number;
  timestamp: number;
  nonce: number;
  emitter_chain: wh.ChainId;
  emitter_address: Uint8Array; // 32 bytes
  sequence: number;
  consistency_level: number;
  payload: Uint8Array;
}
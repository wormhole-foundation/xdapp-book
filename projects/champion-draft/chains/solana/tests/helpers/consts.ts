import { hexToUint8Array } from "@certusone/wormhole-sdk";
import { web3 } from "@project-serum/anchor";

// wormhole
export const CORE_BRIDGE_ADDRESS = new web3.PublicKey("Bridge1p5gheXUvJ6jGWGeCsgPKgnE3YgdGKRVCMY9o");
// export const CORE_BRIDGE_ADDRESS = new web3.PublicKey(process.env.CORE_BRIDGE_ADDRESS);
export const TOKEN_BRIDGE_ADDRESS = new web3.PublicKey("B6RHG3mfcckmrYN1UhmJzyS1XX3fZKbkeUcpJe9Sy3FE");
// export const TOKEN_BRIDGE_ADDRESS = new web3.PublicKey(process.env.TOKEN_BRIDGE_ADDRESS);

// contributor
export const CONDUCTOR_CHAIN: number = parseInt(process.env.CONDUCTOR_CHAIN);
export const CONDUCTOR_ADDRESS: string = process.env.CONDUCTOR_ADDRESS;

// kyc
export const KYC_PRIVATE: string = "b0057716d5917badaf911b193b12b910811c1497b5bada8d7711f758981c3773";

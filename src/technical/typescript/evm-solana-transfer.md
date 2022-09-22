# EVM to Solana Token Transfer

A defining feature of cross chain apps (xDapps) is the ability to move tokens from one chain to another, even if those blockchains have radically different virtual machine models.

To demonstrate, let’s do a simple programmatic transfer from Eth to Solana.

First, determine the address on Solana where we're sending the tokens. Unlike EVM chains where the wallet address is used, we need to send the tokens to the recipient's associated token account for that token. We'll use a couple helper functions from the Wormhole Typescript SDK to make this easier.

```ts
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  getForeignAssetSolana,
  hexToUint8Array,
  nativeToHexString,
  CHAIN_ID_ETH,
} from "@certusone/wormhole-sdk";

const SOLANA_TOKEN_BRIDGE_ADDRESS =
  "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb";
// determine destination address - an associated token account
const solanaMintKey = new PublicKey(
  (await getForeignAssetSolana(
    connection,
    SOLANA_TOKEN_BRIDGE_ADDRESS,
    CHAIN_ID_ETH,
    hexToUint8Array(nativeToHexString(tokenAddress, CHAIN_ID_ETH) || "")
  )) || ""
);
const recipientAddress = await Token.getAssociatedTokenAddress(
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  solanaMintKey,
  recipientWalletAddress
);
```

After we have the receipt token account on Solana, it's time to submit the transfer message on Ethereum. This will output a log that contains a sequence number (a unique number for the message) and an emitter address (the ETH Token Bridge Address in Wormhole format). The sequence number and emitter address will be used to fetch the VAA after it’s been signed by Guardians.

```ts
import {
  trasnferFromEth,
  parseSequenceFromLogEth,
  getEmitterAddressEth,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";

const ETH_TOKEN_BRIDGE_ADDRESS = "0x3ee18B2214AFF97000D974cf647E7C347E8fa585";

// Submit transaction - results in a Wormhole message being published
const receipt = await transferFromEth(
  ETH_TOKEN_BRIDGE_ADDRESS,
  signer,
  tokenAddress,
  amount,
  CHAIN_ID_SOLANA,
  recipientAddress
);
// Get the sequence number and emitter address required to fetch the signedVAA of our message
const sequence = parseSequenceFromLogEth(receipt, ETH_BRIDGE_ADDRESS);
const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
```

Once the Guardians have signed the token bridge VAA, it needs to be retrieved from the Guardian Network. This time we'll use the Guardian GRPC endpoint, though the REST endpoint used in previous sections works as well.

```ts
import { getSignedVAA } from "@certusone/wormhole-sdk";

// Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
const { signedVAA } = await getSignedVAA(
  WORMHOLE_RPC_HOST,
  CHAIN_ID_ETH,
  emitterAddress,
  sequence
);
```

Now, we post the VAA to Solana in order to mint the wrapped tokens. Because of the compute limit on Solana, we split the signature verification and token claim into steps. To do that, verify all the signatures and create a claim account for the token.

```ts
const SOL_BRIDGE_ADDRESS = "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth";
await postVaaSolana(
  connection, // Solana Mainnet Connection
  wallet, //Solana Wallet Signer
  SOL_BRIDGE_ADDRESS,
  payerAddress,
  signedVAA
);
```

Finally, claim the tokens:

```ts
const transaction = await redeemOnSolana(
  connection,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  payerAddress,
  signedVAA,
  isSolanaNative,
  mintAddress
);
const signed = await wallet.signTransaction(transaction);
const txid = await connection.sendRawTransaction(signed.serialize());
await connection.confirmTransaction(txid);
```

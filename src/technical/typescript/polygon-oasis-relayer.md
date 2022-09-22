# Polygon to Oasis with Relayers

In this example, we’ll utilize the token bridge relayer network to complete our token transfer.

This code is written for a browser environment. If you're working in node, consider using node-fetch:

```bash
npm i --save @certusone/wormhole-sdk ethers node-fetch
```

```ts
import { BigNumber, ethers } from "ethers";
import fetch from "node-fetch";
import {
  getEmitterAddressEth,
  hexToUint8Array,
  nativeToHexString,
  parseSequenceFromLogEth,
  CHAIN_ID_POLYGON,
  CHAIN_ID_OASIS,
  transferFromEthNative,
  getIsTransferCompletedEth,
  setDefaultWasm,
} from "@certusone/wormhole-sdk";
```

### Setup the Polygon and Oasis Wallets

Now, set up the two wallets we’ll be sending and receiving from. While we are instantiating both wallets with their private keys, we only need the Public key of the receiving wallet for this example.

```ts
const EmeraldWallet = new ethers.Wallet(
  privatekey_emerald,
  new ethers.providers.JsonRpcProvider("https://emerald.oasis.dev")
);
const PolygonWallet = new ethers.Wallet(
  privatekey_polygon,
  new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/")
);
```

### Fetch the fee schedule

Fetch the fee schedule for the token bridge relayers. This fee schedule outlines the minimum fee for each recipient chain that relayers will accept. As long as we attach at least that fee in the relayer fee, we can expect a relayer pick up the transaction and relay it to the recipient chain. The fee will cover the gas cost for the relayer along with a little extra to make it worth their time to run the relayer service.

We will also define the transfer amount in this step. The fee schedule will either return a flat fee in USD for the recipient chain, or a percentage fee (usually only for Ethereum). Either way, we’ll need to calculate the fee in in BigNumber format (no decimals).

```ts
const transferAmount = BigNumber.from("1000000000000000000"); // We are sending 1 MATIC over the wall to Oasis
const relayerFeeSchedule = await(
  await fetch(
    "https://raw.githubusercontent.com/certusone/wormhole-relayer-list/main/relayer.json"
  )
).json();
```

The fee schedule has the following interface:

```ts
export interface RelayerFeeSchedule {
  supportedTokens: ChainAddress[];
  relayers: Relayer[];
  feeSchedule: FeeSchedule;
}

interface ChainAddress {
  chainId: number;
  address: string;
  coingeckoId: string;
}

interface Relayer {
  name: string;
  url: string;
}

interface FeeSchedule {
  [chainId: string]: {
    type: "flat" | "percent";
    feeUsd?: number;
    feePercent?: number;
    gasEstimate?: number;
  };
}
```

After fetching the fee schedule, find the fee in wei that needs to be paid to the Relayer. At the time of writing, Oasis has a flat fee of $0.50, so to calculate how much MATIC we need to pay for the $0.50 fee, we need to fetch the MATIC price. To do that, use the free CoinGecko api:

```ts
let feeWei: number;
if (relayerFeeSchedule.feeSchedule[CHAIN_ID_OASIS].type == "flat") {
  const feeUsd = relayerFeeSchedule.feeSchedule[CHAIN_ID_OASIS].feeUsd;
  const MATIC_PRICE = await(
    await fetch(
      "https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270&vs_currencies=usd"
    )
  ).json()["0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"]["usd"];

  feeWei = (feeUsd / MATIC_PRICE) * 1e18;
} else if (relayerFeeSchedule.feeSchedule[CHAIN_ID_OASIS].type == "percent") {
  let feeWei =
    (relayerFeeSchedule.feeSchedule[CHAIN_ID_OASIS].feePercent / 100) *
    transferAmount.toNumber();
}
```

### Overrides & Quirks

Dependent on the specific blockchains you are working with, you may need to perform special actions when submitting this transaction. Because we're dealing with Polygon in this example, there's an additional step to overestimate the gas. This is because Ethers library has some problems with fee estimation after EIP-1559.

```ts
let overrides;
let feeData = await PolygonWallet.provider.getFeeData();
overrides = {
  maxFeePerGas: feeData.maxFeePerGas?.mul(50) || undefined,
  maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.mul(50) || undefined,
};
```

### Emit Token Bridge Message

Now we have all the pieces we need to emit a token bridge message with a relay fee attached. We do this using the transferFromEthNative() method. EthNative is used because we’re transferring the native token of the Polygon network rather than an ERC20 token.

```ts
const POLYGON_TOKEN_BRIDGE = "0x5a58505a96D1dbf8dF91cB21B54419FC36e93fdE";

const receipt = await transferFromEthNative(
  POLYGON_TOKEN_BRIDGE,
  PolygonWallet,
  transferAmount,
  CHAIN_ID_OASIS,
  hexToUint8Array(
    nativeToHexString(await EmeraldWallet.getAddress(), CHAIN_ID_OASIS) || ""
  ),
  BigNumber.from(feeWei.toString()),
  overrides
);
console.log("Receipt: ", receipt);

const POLYGON_CORE_BRIDGE_ADDRESS =
  "0x7A4B5a56256163F07b2C80A7cA55aBE66c4ec4d7";
const sequence = parseSequenceFromLogEth(receipt, POLYGON_CORE_BRIDGE_ADDRESS);
const emitterAddress = getEmitterAddressEth(POLYGON_TOKEN_BRIDGE);
console.log("Sequence: ", sequence);
console.log("EmitterAddress: ", emitterAddress);
```

Let’s walk through each of the arguments of this function and what they mean.

`POLYGON_TOKEN_BRIDGE` is the address of the token bridge module on the Polygon network. You can find it and other addresses on the Deployment Info page.

`PolygonWallet` is a signer you get from the Ethers library that holds a private key that can sign transactions.

`transferAmount` is a BigNumber that contains the amount to transfer in the smallest unit of the network.

`CHAIN_ID_OASIS` is a constant that identifies the target chain.

`hexToUint8Array()` translates the target publickey into a wormhole public key.

`BigNumber.from(feeWei.toString())` identifies the fee in smallest unit of the network for the relayer.

`overrides` are used if we need to override the gas cost, which we need to do for Polygon.

### Check VAA was signed

Wait 15 min for finality on Polygon and then check to see if it was submitted. If successful, you’ll be able to fetch a base64 encoded vaaBytes. We need this in the next step where we check if the transaction was successfully relayed.

```ts
await new Promise((r) => setTimeout(r, 900000)); //15m in seconds
const WORMHOLE_RPC = "https://wormhole-v2-mainnet-api.certus.one";
let vaaBytes = undefined;
while (!vaaBytes) {
  try {
    vaaBytes = await(
      await fetch(
        `${WORMHOLE_RPC}/v1/signed_vaa/${CHAIN_ID_POLYGON}/${emitterAddress}/${sequence}`
      )
    ).json().vaaBytes;
  } catch (e) {
    await new Promise((r) => setTimeout(r, 5000));
  }
}
console.log("VAA Bytes: ", vaaBytes);
```

### Check if the transfer was completed

In the final step, use the getIsTransferCompletedEth() method to check if the transfer was completed on the Oasis Emerald chain. If it’s not, wait 5 seconds and check again.

```ts
setDefaultWasm("node"); //only needed if running in node.js
const EMERALD_TOKEN_BRIDGE = "0x5848C791e09901b40A9Ef749f2a6735b418d7564";
let transferCompleted = await getIsTransferCompletedEth(
  EMERALD_TOKEN_BRIDGE,
  EmeraldWallet.provider,
  vaaBytes
);
while (!transferCompleted) {
  await new Promise((r) => setTimeout(r, 5000));
  transferCompleted = await getIsTransferCompletedEth(
    EMERALD_TOKEN_BRIDGE,
    EmeraldWallet.provider,
    vaaBytes
  );
}

console.log("VAA Relayed!");
```

Success! You've programmatically relayed a transaction!

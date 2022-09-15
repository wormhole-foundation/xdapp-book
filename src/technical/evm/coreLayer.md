# Core Layer

This section will explain how to properly interact with the Wormhome Core Layer in an EVM ecosystem.

## Configuring the Interface

- Get the interface from the repo
- Instantiate it with the core layer contract address for your blockchain. This is dependent on your development ecosystem and blockchain. This value is usually stored in your contract state.

[Here](https://github.com/wormhole-foundation/wormhole/blob/dev.v2/ethereum/contracts/interfaces/IWormhole.sol) is the interface for applications to interact with Wormhole's Core Contract to publish messages or verify and parse a received message.

Instantiating the interface will depend on your development ecosystem and blockchain. The Wormhole Core Layer contract address is usually stored in your contract address.

Below is an example line of code to instantiate the interface for mainnet Ethereum:

```
address private wormhole_core_bridge_address = address(0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B);
IWormhole core_bridge = IWormhole(wormhole_core_bridge_address);
```

## Primary functions

The Wormhole Core Layer effectively only has two important interactions - (1) the ability to emit messages, and (2) the ability to parse and verify messages which originated from other chains.

### Emitting a Message

- Always uses publish message
- explain every argument
- be sure to mention batch VAAs

To emit a message, always use `publishMessage` which takes in the following arguments:

1.  `nonce` (uint32): a number assigned to each message
    - The `nonce` gives the receving contract a mechanism by which to make sure it does not double process messages
    - Batch VAAs allow for easier compsability and better gas efficiency of multiple messages. To do this, messages emitted within the same transaction with the same nonce are bundled together into one aggregate message. Messages with a nonce of `0` will not be included in a Batch VAA and emitted individually.
2.  `Consistency` (uint8): the number of blocks that Guardians will wait before signing a message.
    - Each blockchain has different finality periods. In general, higher consistencies mean more security against blockchain reorgs.
    - [Here]() are the consistency levels by blockchain that are used by the xAsset layer to have a high level of guarantee against reorgs.
3.  `Payload` (bytes[]): raw bytes to emit.
    - It is up to the emitting contract to properly define this arbitrary set of bytes.

`publishMessage` will output a `sequence` (uint64) that is used in conjunction with `emitterChainID` and `emitterAddress` to retrive the generated VAA from the Guardian Network.

### Parsing and Verifying a Message

- Explain how a message should be taken in as a byte array
- Be cognizant of Batch VAAs vs Single VAAs
- entrypoint code vs module code. If using single VAAs, these are the same, but batch VAAs are more complicated to verify
- remember to collect your gas after all the VAAs have been verified

Parsing and Verifying a message will depend on the type of VAA that your application expects: a Single VAA or a Batch VAA.

For either message type, remember to collect gas fees associated with submitting them on-chain after all VAAs have been verified.

**Single VAA**

To properly parse and verify a single VAA, always use `parseAndVerifyVM` which takes in one argument: `encodedVM` (bytes). This function will return three arguments:

1. `vm` (VM): Structured data that reflects the content of the VAA. A breakdown of this message format is described in the [VAA](../../wormhole/4_vaa.md) section. It is up to the receving contracting to properly parse this data structure for the necessary information.
2. `valid` (bool): Boolean that reflects whether or not the VAA was properly signed by the Guardian Network
3. `reason` (string): Explanatory error message if a VAA is invalid, or an empty string if it is valid.

**Batch VAA**

To properly parse and verify a batch VAA, always use `parseAndVerifyBatchVM` which takes in two arguments: `encodedVM` (bytes) and `cache` (bool).

Batch VAAs are designed so that relayers can choose to submit any subset of the observations batched together. It is the receiving contract's responsiblity to verify that all VAAs contained in a batch are submitted.

---

Code recommendation, write the code which expects to receive a VAA to utilize parseAndVerifyVM(? unsure if this is the correct call). That way, your code will be able to handle either type 1 VAAs (single VAAs), or type 3 VAAs (headless VAAs). This allows it to utilize both single & batch VAAs and dramatically increases composeability. \*this only requires like two or three lines of code, so this would be a good candidate for a code example which shows how to properly use batch vaas without breaking composeability. Should note that the module code still ALWAYS needs to verify, but should do so with the 'single' message verifying and then expose that function publicly in order to enable composeability.

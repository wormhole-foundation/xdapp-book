# Core Message Layer

This section will explain how to properly interact with the Wormhome Core Message Layer in an EVM ecosystem.

Messages in Wormhole take the form of a Verified Action Approval (VAA) and both terms can be used interchangably. The rest of this section will only use the term VAA.

## Configuring the Interface

[Here](https://github.com/wormhole-foundation/wormhole/blob/dev.v2/ethereum/contracts/interfaces/IWormhole.sol) is the interface for applications to interact with Wormhole's Core Contract to publish VAAs or verify and parse a received VAAs.

Instantiating the interface will depend on the contract address of your development ecosystem and blockchain.

Below is an example line of code to instantiate the interface for mainnet Ethereum:

```
address private wormhole_core_bridge_address = address(0x98f3c9e6E3fAce36bAAd05FE09d375Ef1464288B);
IWormhole core_bridge = IWormhole(wormhole_core_bridge_address);
```

## Primary functions

The Wormhole Core Layer effectively only has two important interactions -- (1) emit VAAs, and (2) parse and verify VAAs that originated from other chains.

### Emitting a VAA

There are two forms that VAAs can be emitted within Wormhole:
- Single VAA: all messages will be emitted in this format
- Batch VAA: messages that are generated from the same transaction will be emitted in this format. This feature was developed to provide an easier paradigm for composability and better gas efficiency for more involved cross-chain activity. 

To emit a VAA, always use `publishMessage` which takes in the following arguments:

1.  `nonce` (uint32): a number assigned to each message
    - The `nonce` provides a mechanism by which to group messages together within a Batch VAA.
    - How Batch VAAs are generated based on a message's `nonce` is described below.
2.  `Consistency` (uint8): the number of blocks that Guardians will wait before signing a message
    - Each blockchain has different finality periods. In general, higher consistencies mean more security against blockchain reorgs.
    - [Here]() are the consistency levels by blockchain that are used by the xAsset layer to have a high level of guarantee against reorgs.
3.  `Payload` (bytes[]): raw bytes to emit
    - It is up to the emitting contract to properly define this arbitrary set of bytes.

`publishMessage` will output a `sequence` (uint64) that is used in conjunction with `emitterChainID` and `emitterAddress` to retrive the generated VAA from the Guardian Network.

> How Batch VAAs are generated
> 
> There are two mechanisms that allow messages to be Batched together that represent a base and more advanced level of compsability.
> 
> 1. All messages originating from the same transaction will be batched together.
> 2. Messages that originate from the same transaction and are assigned the same nonce are additionally batched together.
>
> _Note: Single VAAs will always be emitted for each message within a transaction, regardless of if a message is included in a batch or not._
>
> Here is an example of how messages generated from the same transaction may be batched together:
> 
> A transaction X that generates 6 messages [A, B, C, D, E, F] that are assigned `nonce` [1, 2, 2, 3, 3, 4] respectively will generate the following VAAs:
> - (1) full transaction batch VAA
>   - [A, B, C, D, E, F]
> - (2) smaller batch VAA
>   - [B, C]
>   - [D, E]
> - (6) single VAA
>   - [A]
>   - [B]
>   - [C]
>   - [D]
>   - [E]
>   - [F]


### Parsing and Verifying a VAA

Parsing and Verifying a VAA will depend on the type of VAA that your application expects: a Single VAA or a Batch VAA.

For either VAA type, remember to collect gas fees associated with submitting them on-chain after all VAAs have been verified.

**Single VAA**

To properly parse and verify a single VAA, always use `parseAndVerifyVM` which takes in one argument: `encodedVM` (bytes). This function will return three arguments:

1. `vm` (VM): Structured data that reflects the content of the VAA.
   - A breakdown of this message format is described in the [VAA](../../wormhole/4_vaa.md) section. Aside from the header information, which can be considered 'trusted', it is up to the recipient contract to properly parse the remaining payload, as this contains the verbatim message sent from the emitting contract.
2. `valid` (bool): Boolean that reflects whether or not the VAA was properly signed by the Guardian Network
3. `reason` (string): Explanatory error message if a VAA is invalid, or an empty string if it is valid.

<!--
TODO
everything about this
**Batch VAA**


To properly parse and verify a batch VAA, always use `parseAndVerifyBatchVM` which takes in two arguments: `encodedVM` (bytes) and `cache` (bool).

Batch VAAs are designed so that relayers can choose to submit any subset of the observations batched together. It is the receiving contract's responsiblity to verify that all VAAs contained in a batch are submitted.

---

Code recommendation, write the code which expects to receive a VAA to utilize parseAndVerifyVM(? unsure if this is the correct call). That way, your code will be able to handle either type 1 VAAs (single VAAs), or type 3 VAAs (headless VAAs). This allows it to utilize both single & batch VAAs and dramatically increases composability. \*this only requires like two or three lines of code, so this would be a good candidate for a code example which shows how to properly use batch vaas without breaking composability. Should note that the module code still ALWAYS needs to verify, but should do so with the 'single' message verifying and then expose that function publicly in order to enable composability.

-->

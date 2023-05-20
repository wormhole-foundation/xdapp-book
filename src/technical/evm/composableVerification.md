# Composable Verification

Wormhole offers flexible [Consistency Levels](/wormhole/3_coreLayerContracts.md#consistency-levels), but more advanced integrators may want additional layers of verification.

Working examples of the following are available in [this example repo](https://github.com/wormhole-foundation/example-composable-verification).

## Additional Signers

If your project has some additional off-chain processes or checks to perform _after_ a message was emitted but _before_ it could be consumed on the receiving chain, you may want to consider adding an additional signer requirement to your integration. There are plenty of ways to achieve this concept, but an approach like the following keeps the emission and verification in your integrating contract, entirely separate from Wormhole.

### 1. Emit a unique message hash

```solidity
event LogMessageHash(bytes32 hash);
...
bytes32 messageHash = keccak256(
  abi.encodePacked(encodedMessage, messageSequence)
);
emit LogMessageHash(messageHash);
```

After calling `publishMessage`, emit a hash for the message and sequence number which makes the announced signature will be unique for two different instances of the same message contents. You could also make it more unique across implementations by including the sending chain id and contract address.

### 2. Sign the hash

```solidity
function getSigningHash(bytes32 _messageHash) public view returns (bytes32) {
  return
    keccak256(abi.encodePacked(_messageHash, block.chainid, address(this)));
}
```

It is helpful to have a utility function on the receiving side so you can generate an even more unique hash which ensures the signature you generate is intended for this receiving chain and contract address.

```typescript
const {
  args: { hash },
} = sender.interface.parseLog(log);
const signingHash = await receiver.getSigningHash(hash);
const additionalSignature = await signer.signMessage(
  ethers.utils.arrayify(signingHash)
);
```

Have your off-chain process pick up logs via your preferred method (like `finalized` block polling for `eth_getLogs`), perform its duties, and produce a signature.

### 3. Verify the signature

```solidity
function receiveMessage(
  bytes memory _vaa,
  bytes memory _additionalSignature
) public {
  ...
  require(
    verify(
      keccak256(
        abi.encodePacked(wormholeMessage.payload, wormholeMessage.sequence)
      ),
      _additionalSignature
    ),
    "invalid additional signature"
  );
  ...
}

function verify(
  bytes32 _messageHash,
  bytes memory _signature
) public view returns (bool) {
  bytes32 signingHash = getSigningHash(_messageHash);
  bytes32 ethSignedMessageHash = getEthSignedMessageHash(signingHash);
  return recoverSigner(ethSignedMessageHash, _signature) == signerAddress;
}
```

Add another parameter to your `receiveMessage` function and after calling `parseAndVerifyVM`, verify that the additional signature checks out!

## Two-Bridge Rule

This example sends a message from Ethereum to Optimism via Wormhole _and_ sends the hash of that message via the [native bridge](https://community.optimism.io/docs/developers/bridge/messaging/). The receiver then requires both messages to agree, like requiring two keys to open a safe.

### 1. Send a unique hash natively

```solidity
/// Optimism L1-L2 bridge from https://community.optimism.io/docs/useful-tools/networks/#optimism-goerli
address public crossDomainMessengerAddr =
  0x5086d1eEF304eb5284A0f6720f79403b4e9bE294;
/// Optimism bridge requires a recipient address so the message can be relayed
address public receiverL2Addr;
...
// Send the expected message hash and sequence via the native bridge
bytes32 messageHash = keccak256(
  abi.encodePacked(encodedMessage, messageSequence)
);
ICrossDomainMessenger(crossDomainMessengerAddr).sendMessage(
  receiverL2Addr,
  abi.encodeWithSignature("expectPayload(bytes32)", messageHash),
  1000000 // within the free gas limit amount
);
```

Similar to the previous example, after calling `publishMessage`, send a hash for the message and sequence number over the native bridge.

### 2. Receive the expected hash

```solidity
/// Sender contract address for confirming validity of native bridge messages
address public immutable l1SenderAddress;
/// Stores the expected payload hash
bytes32 public expectedPayloadHash;
/// Used by the native bridge to set the expected payload hash
/// This signature must match the ICrossDomainMessenger.sendMessage call in the Sender
/// @param _expectedPayloadHash The hash of the expected payload for the corresponding Wormhole message
function expectPayload(bytes32 _expectedPayloadHash) public {
  require(getXorig() == l1SenderAddress, "invalid sender");
  expectedPayloadHash = _expectedPayloadHash;
}
```

Again similar to a basic Wormhole integration where you [verify the emitter](./bestPractices.md#receiving-messages), verify that this message came from the expected L1 contract. This example only “expects” one message at a time, but you could just as easily make this a map like `processedMessages`.

### 3. Verify the hashes match

```solidity
require(
  keccak256(
    abi.encodePacked(wormholeMessage.payload, wormholeMessage.sequence)
  ) == expectedPayloadHash,
  "unexpected payload"
);
```

After calling `parseAndVerifyVM`, verify that the hash checks out!

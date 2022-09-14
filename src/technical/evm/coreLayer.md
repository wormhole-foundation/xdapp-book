# Core Layer

This section will explain how to properly interact with the Wormhome Core Layer in an EVM ecosystem.

# Configuring the Interface

- Get the interface from the repo
- Instantiate it with the core layer contract address for your blockchain. This is dependent on your development ecosystem and blockchain. This value is usually stored in your contract state.

This is the interface for applications to interact with Wormhole's Core Contract to publish messages or verify and parse a received message.

//TODO just link to the github repo, in order to avoid stale information

```
// contracts/Messages.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "../Structs.sol";

interface IWormhole is Structs {
    event LogMessagePublished(address indexed sender, uint64 sequence, uint32 nonce, bytes payload, uint8 consistencyLevel);

    function publishMessage(
        uint32 nonce,
        bytes memory payload,
        uint8 consistencyLevel
    ) external payable returns (uint64 sequence);

    function parseAndVerifyVM(bytes calldata encodedVM) external view returns (Structs.VM memory vm, bool valid, string memory reason);

    function verifyVM(Structs.VM memory vm) external view returns (bool valid, string memory reason);

    function verifySignatures(bytes32 hash, Structs.Signature[] memory signatures, Structs.GuardianSet memory guardianSet) external pure returns (bool valid, string memory reason) ;

    function parseVM(bytes memory encodedVM) external pure returns (Structs.VM memory vm);

    function getGuardianSet(uint32 index) external view returns (Structs.GuardianSet memory) ;

    function getCurrentGuardianSetIndex() external view returns (uint32) ;

    function getGuardianSetExpiry() external view returns (uint32) ;

    function governanceActionIsConsumed(bytes32 hash) external view returns (bool) ;

    function isInitialized(address impl) external view returns (bool) ;

    function chainId() external view returns (uint16) ;

    function governanceChainId() external view returns (uint16);

    function governanceContract() external view returns (bytes32);

    function messageFee() external view returns (uint256) ;
}
```

//TODO example line of code for instantiating the interface for mainnet Ethereum

## Primary functions

The Wormhole Core Layer effectively only has two important interactions. The ability to emit messages, and the ability to verify messages which originated from other chains.

### Emitting a Message

- Always uses publish message
- explain every argument
- be sure to mention batch VAAs

### Verifying a Message

- Explain how a message should be taken in as a byte array
- Be cognizant of Batch VAAs vs Single VAAs
- entrypoint code vs module code. If using single VAAs, these are the same, but batch VAAs are more complicated to verify
- remember to collect your gas after all the VAAs have been verified

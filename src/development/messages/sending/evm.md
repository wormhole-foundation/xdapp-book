# Sending Messages: EVM

To send messages from EVM, first we have to download the Core Bridge interfaces.

We need two interfaces, [IWormhole.sol](https://github.com/wormhole-foundation/wormhole/raw/main/ethereum/contracts/interfaces/IWormhole.sol) and [Structs.sol](https://github.com/wormhole-foundation/wormhole/raw/main/ethereum/contracts/Structs.sol)

In your xdapp-starter, place those files in

```
- chains/
    - evm/
        - src/
            - Wormhole/
                - IWormhole.sol
                - Structs.sol
```

Let's also modify the IWormhole.sol file to update the import for Structs.sol.

```solidity
// contracts/Messages.sol
// SPDX-License-Identifier: Apache 2

pragma solidity ^0.8.0;

import "./Structs.sol";

..

```

Now, let's create a new contract in our src/ folder `Messenger.sol`. In this contract, we'll also create a uint32 nonce. You can think of this nonce like a message id--it's just a number that lets the receiving contract know if it has already processed a message.

Also, we'll set the consistency level here to 1, because we're just testing and want the Guardians to sign this VAA as soon as they see it. If we were deploying to production, we might want to match this level to the deployed chain's finality guarantees.

```solidity

//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Wormhole/IWormhole.sol";

contract Messenger {
    //This is the Tilt Devnet address constant.
    //Replace this address with relevant testnet or mainnet address of the chain you're deploying too.
    address private wormhole_core_bridge_address = address(0xC89Ce4735882C9F0f0FE26686c53074E09B0D550);

    IWormhole core_bridge = IWormhole(wormhole_core_bridge_address);

    uint32 nonce = 0;

    constructor(){}

    function sendMsg(bytes memory str) public returns (uint64 sequence) {
        uint8 consistency_level = 1;
        sequence = core_bridge.publishMessage(nonce, str, consistency_level);
        nonce = nonce+1;
    }
}


```

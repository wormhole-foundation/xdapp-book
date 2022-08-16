# EVM: Transferring a Token

WARNING: To be able to successfully transfer a token from one chain to another, make sure you [attest](./attestingToken.md) it first. Otherwise the Token may be transferred, but you won't be able to claim it until it's attested.

One challenge that arises for new EVM developers is that, because EVM uses unsigned integers, there's no concept of decimals. Therefore, tokens usually have up to 18 zeros behind them to denote up to 18 decimal places. Wormhole normalizes this to *eight* zeros, with transfer amounts rounded down to the nearest 8th decimal. 

To wrap the Token Bridge functions in your contract, you can use the Token Bridge interfaces provided under [`projects/evm-tokenbridge/chains/evm/src/Wormhole`](https://github.com/certusone/xdapp-book/tree/main/projects/evm-tokenbridge/chains/evm/src/Wormhole) folder of the xDapp Book repository.

```solidity
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/PortalWrappedToken.sol";

contract Treasury {

    address private token_bridge_address = address(0x0290FB167208Af455bB137780163b7B7a9a10C16);
    ITokenBridge token_bridge = ITokenBridge(token_bridge_address);
    address private TKN_address = address(0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A); 
    ERC20PresetMinterPauser TKN = ERC20PresetMinterPauser(TKN_address);

    uint32 nonce = 0;

    function bridgeToken(uint256 amt, uint16 receipientChainId, bytes32 recipient) public returns (uint64 sequence) {
        nonce += 1;
        return token_bridge.transferTokens(TKN_address, amt, receipientChainId, recipient, 0, nonce);
    }   

    function approveTokenBridge(uint256 amt) public returns (bool) {
        return TKN.approve(token_bridge_address, amt);
    }
}

```

To transfer a token, first we have to *approve* the Token Bridge to be able to spend that token on our behalf (so it can transfer tokens form our contract to itself). Make sure the `bridgeAmt` properly accounts for decimals in the ERC20 token.

```js
// Here we are approving and transfering 50 tokens. The ERC20 token we are transfering has 18 decimal places.
const bridgeAmt = ethers.utils.parseUnits("50", "18");

await treasury.approveTokenBridge(bridgeAmt, {
    gasLimit: 2000000,
});

```

Then we simply call `transfer` to create the transfer VAA and fetch it from the Guardians when it's ready. Note that the target receipient is a Wormhole normalized hex address left-padded to 32 bytes. 

```js
const targetRecepient = Buffer.from(tryNativeToHexString(targetDeployment.deployedAddress, "ethereum"), 'hex');

const tx = await (await treasury.bridgeToken(
    bridgeAmt,
    targetNetwork.wormholeChainId,
    targetRecepient
)).wait();
const emitterAddr = getEmitterAddressEth(network.tokenBridgeAddress);
const seq = parseSequenceFromLogEth(tx, network.bridgeAddress);
const vaaURL =  `${config.wormhole.restAddress}/v1/signed_vaa/${network.wormholeChainId}/${emitterAddr}/${seq}`;
let vaaBytes = await (await fetch(vaaURL)).json();
while(!vaaBytes.vaaBytes){
    console.log("VAA not found, retrying in 5s!");
    await new Promise((r) => setTimeout(r, 5000)); //Timeout to let Guardiand pick up log and have VAA ready
    vaaBytes = await (await fetch(vaaURL)).json();
}

```
After we've fetched the VAA, we can call the `completeTransfer()` function on the target chain if it's an EVM.

```js

const completeTransferTx = await targetTokenBridge.completeTransfer(Buffer.from(vaaBytes.vaaBytes, "base64"));

```




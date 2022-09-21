// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Wormhole/IWormhole.sol";
import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/BridgeStructs.sol";
import "solidity-bytes-utils/BytesLib.sol";

contract Xmint is ERC20 {
    using BytesLib for bytes;

    mapping(uint16 => bytes32) _applicationContracts;
    mapping(bytes32 => bool) _completedMessages;
    address owner;
    IWormhole core_bridge;
    ITokenBridge token_bridge;
    uint32 nonce = 0;
    event Log(string indexed str);

    constructor(
        string memory name_,
        string memory symbol_, 
        address coreBridgeAddress,
        address tokenBridgeAddress
    ) ERC20(name_, symbol_) {
        owner = msg.sender;
        core_bridge = IWormhole(coreBridgeAddress);
        token_bridge = ITokenBridge(tokenBridgeAddress);
    }

    /**
        Registers it's sibling applications on other chains as the only ones that can send this instance messages    
    */
    function registerApplicationContracts(uint16 chainId, bytes32 emitterAddr) public {
        require(msg.sender == owner, "Only owner can register new chains!");
        _applicationContracts[chainId] = emitterAddr;
    }

    /**
        Takes inventory of the foreign currency
        Mints tokens to self
        Transfers tokens with Payload 1 to Receipient on Foreign chain
     */
    function submitForeignPurchase(bytes memory encodedVm) public returns (uint64) {
        // Complete transfer will give the Tokens to this Contract
            // Unlike solana, we don't need to check that the emitter is a Portal contract as register_ scripts register all the Portal contracts
            // and the completeTransfer function checks the emitter is a valid Portal contract on one of the chains it's registered with
        BridgeStructs.TransferWithPayload memory vaa = _decodePayload(token_bridge.completeTransferWithPayload(encodedVm));
        // Mint tokens to this contract
            //amt they paid is NATIVE
            //multiply by 100 to get how many tokens to give out
        uint256 amtToMint = vaa.amount * 100;
        _mint(address(this), amtToMint);
        // Give Token Bridge allowance to take tokens from this contract
        this.approve(address(token_bridge), amtToMint);
        // Transfer tokens via Token Bridge over to Recipient in payload
        uint64 sequence = token_bridge.transferTokens(address(this), amtToMint, vaa.tokenChain, bytes32(vaa.payload), 0, nonce);
        nonce += 1;
        return sequence;
    }

    function _decodePayload(bytes memory payload) internal pure returns (BridgeStructs.TransferWithPayload memory) {
        BridgeStructs.TransferWithPayload memory decoded = BridgeStructs.TransferWithPayload({
            payloadID: payload.slice(0,1).toUint8(0),
            amount: payload.slice(1,32).toUint256(0),
            tokenAddress: payload.slice(33,32).toBytes32(0),
            tokenChain: payload.slice(65,2).toUint16(0),
            to: payload.slice(67,32).toBytes32(0), 
            toChain: payload.slice(99,2).toUint16(0),
            fromAddress: payload.slice(101,32).toBytes32(0),
            payload: payload.slice(133, payload.length-133)
        });

        return decoded;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Wormhole/IWormhole.sol";
import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/BridgeStructs.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";

contract Xmint is ERC20 {
    using BytesLib for bytes;

    mapping(uint16 => bytes32) _applicationContracts;
    mapping(bytes32 => bool) _completedMessages;
    address owner;
    IWormhole core_bridge;
    ITokenBridge token_bridge;
    uint32 nonce = 0;
    event PayloadLog(bytes indexed payload);
    event Log(string indexed str);

    constructor(
        string memory name_,
        string memory symbol_, 
        address coreBridgeAddress,
        address tokenBridgeAddress
    ) ERC20(name_, symbol_) {
        emit Log("Constructor Log");
        owner = msg.sender;
        core_bridge = IWormhole(coreBridgeAddress);
        token_bridge = ITokenBridge(tokenBridgeAddress);
    }

    /**
        Registers it's sibling applications on other chains as the only ones that can send this instance messages    
    */
    function registerApplicationContracts(uint16 chainId, bytes32 applicationAddr) public {
        require(msg.sender == owner, "Only owner can register new chains!");
        _applicationContracts[chainId] = applicationAddr;
    }

    /**
        Takes inventory of the foreign currency
        Mints tokens to self
        Transfers tokens with Payload 1 to Receipient on Foreign chain
     */
    function submitForeignPurchase(bytes memory encodedVm) public returns (uint64) {
        // Complete transfer will give the Tokens to this Contract
        BridgeStructs.TransferWithPayload memory vaa = _decodePayload(token_bridge.completeTransferWithPayload(encodedVm));
        // Mint tokens to this contract
            //amt they paid is NATIVE
            //multiply by 100 to get how many tokens to give out
        uint256 amtToMint = vaa.amount * 100;
        _mint(address(this), amtToMint);
        // Transfer tokens via Token Bridge over to Recipient in payload
        uint64 sequence = token_bridge.transferTokens(address(this), amtToMint, vaa.tokenChain, bytes32(vaa.payload), 0, nonce);
        nonce += 1;
        return sequence;
    }

    function _decodePayload(bytes calldata payload) internal returns (BridgeStructs.TransferWithPayload memory) {
        uint index = 0;
        BridgeStructs.TransferWithPayload calldata decoded = BridgeStructs.TransferWithPayload({
            payloadID: payload[0:1],
            amount: payload[1:31],
            tokenAddress: payload[32:39],
            tokenChain: payload[39:71],
            to: payload[71:103], 
            toChain: payload[103:105],
            fromAddress: payload[105:137],
            payload: payload[137:]
        });
    }   
}
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//If the below line shows an error, ignore it, it's cause you're root folder is not chains/evm. 
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./Wormhole/ITokenBridge.sol";
import "./Wormhole/PortalWrappedToken.sol";

contract Treasury {

    address private token_bridge_address = address(0x0290FB167208Af455bB137780163b7B7a9a10C16);
    ITokenBridge token_bridge = ITokenBridge(token_bridge_address);
    address private TKN_address = address(0x2D8BE6BF0baA74e0A907016679CaE9190e80dD0A); 
    ERC20PresetMinterPauser TKN = ERC20PresetMinterPauser(TKN_address);

    uint32 nonce = 0;
    mapping(uint16 => bytes32) _applicationContracts;
    mapping(bytes32 => bool) _completedMessages;

    address owner;

    constructor(){
        owner = msg.sender;
    }

    /**
        Registers it's sibling applications on other chains as the only ones that can send this instance messages
     */
    function registerApplicationContracts(uint16 chainId, bytes32 applicationAddr) public {
        require(msg.sender == owner, "Only owner can register new chains!");
        _applicationContracts[chainId] = applicationAddr;
    }

    //Returns the Balance of this Contract
    function getTKNCount() public view returns (uint256) {
        return TKN.balanceOf(address(this));
    }

    //Returns the Balance of Wrapped Count
    function getWrappedCount(PortalWrappedToken wrappedToken) public view returns (uint256) {
        return wrappedToken.balanceOf(address(this));
    }

    function bridgeToken(uint256 amt, uint16 receipientChainId, bytes32 recipient) public returns (uint64 sequence) {
        nonce += 1;
        return token_bridge.transferTokens(TKN_address, amt, receipientChainId, recipient, 0, nonce);
    }   

    function approveTokenBridge(uint256 amt) public returns (bool) {
        return TKN.approve(token_bridge_address, amt);
    }
}
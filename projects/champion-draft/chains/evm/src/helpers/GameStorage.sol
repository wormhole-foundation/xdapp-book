pragma solidity ^0.8.13;
import "../Wormhole/Messenger.sol";
import "../lib/GameLib.sol";

contract GameStorage {
    uint256 public nonce = 0;
    // mapping from champion hash to champion
    mapping(uint256 => GameLib.Champion) public champions;
    mapping(uint256 => mapping(bytes32 => bool)) public championsClaimedXP;
    Messenger public messenger;
    uint32 public curRound;
    uint256 public roundStart;

    mapping (address => GameLib.AudienceMember) public audience;
    mapping (address => mapping(bytes32 => bool)) public audienceClaimedPoints;
}
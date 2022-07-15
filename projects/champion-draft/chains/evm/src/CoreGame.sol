// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Wormhole/Messenger.sol";
import { GamexRegister } from "./modules/GamexRegister.sol";
import { GamexBattle } from "./modules/GamexBattle.sol";
import { GamexDraft } from "./modules/GamexDraft.sol";
import { GamexVote } from "./modules/GamexVote.sol";

contract CoreGame is GamexRegister, GamexBattle, GamexDraft, GamexVote {
    address owner;

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "You must be the owner of the contract to modify rounds!"
        );
        _;
    }

    constructor(address _wormhole_core_bridge_address) {
        messenger = new Messenger(_wormhole_core_bridge_address);
        curRound = 0;
        roundStart = block.timestamp;
        owner = msg.sender;
    }

    function setRoundStart(uint256 newStart) public onlyOwner {
        require(
            block.timestamp < newStart,
            "The round must start after the current time."
        );
        roundStart = newStart;
        curRound = 0;
    }

    function setRound(uint32 round) public onlyOwner {
        curRound = round;
        roundStart = block.timestamp;
    }

    function getMessengerAddr() public view returns (address) {
        return address(messenger);
    }
}

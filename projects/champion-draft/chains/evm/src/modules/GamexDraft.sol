// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {GameHelpers} from "../helpers/GameHelpers.sol";
import {GameLib} from "../lib/GameLib.sol";

contract GamexDraft is GameHelpers {
    function registerAudienceMember(uint _currentDraft) public checkRounds(GameLib.ActionType.REGISTER) {
        GameLib.AudienceMember memory newMember;
        newMember.currentDraft = _currentDraft;
        newMember.timestamp = block.timestamp;
        audience[msg.sender] = newMember;
    }

    // function changeAudienceDraft(uint _newDraft) public checkRounds(GameLib.ActionType.REGISTER) {
    //     GameLib.AudienceMember storage me = audience[msg.sender];
    //     me.currentDraft = _newDraft;
    //     me.timestamp = block.timestamp;

    //     // TODO: Points are reset to zero. Future feature, user retains points from previous champions drafted.
    //     me.points = 0;
    // }

    function audienceClaimPoints(bytes memory vaa) public checkRounds(GameLib.ActionType.REGISTER) {
        (string memory payload, bytes32 vm_hash) = messenger
            .receiveEncodedMsgOnce(vaa);

        if (audienceClaimedPoints[msg.sender][vm_hash]) {
            revert("You have already claimed the points for the battle.");
        }

        GameLib.BattleOutcome memory b = abi.decode(bytes(payload), (GameLib.BattleOutcome));

        GameLib.AudienceMember storage me = audience[msg.sender];

        if (b.winnerHash != me.currentDraft) {
            // if my draft is not the winner
            revert(
                "You are not impacted from this battle."
            );
        }

        if (me.timestamp > b.timestamp) {
            // if I drafted the champion after the battle happened
            revert("You drafted the champion after the battle happened.");
        }

        audienceClaimedPoints[msg.sender][vm_hash] = true;
        me.points += 1;
    }
}
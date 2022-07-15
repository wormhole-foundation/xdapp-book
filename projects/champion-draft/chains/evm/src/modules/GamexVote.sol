// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {GameHelpers} from "../helpers/GameHelpers.sol";
import {GameLib} from "../lib/GameLib.sol";

contract GamexVote is GameHelpers {
    function audienceSubmitVote(uint8 choice) public checkRounds(GameLib.ActionType.REGISTER) {
        GameLib.AudienceMember storage me = audience[msg.sender];

        uint myDraftHash = me.currentDraft;

        if (me.points == 0) {
            revert("You don't have enough points to perform this action.");
        }
        if (choice > 4) {
            revert("Invalid choice.");
        }
        if ((getUpgrades(myDraftHash) >> (4 - choice)) & 0x01 == 0) {
            revert(
                "You are not allowed to vote for that stat. See getUpgrades for available upgrades."
            );
        }

        GameLib.AudienceVotes storage votes = champions[myDraftHash].votes;

        if (choice == 1) {
            votes.attack += 1;
        } else if (choice == 2) {
            votes.defense += 1;
        } else if (choice == 3) {
            votes.speed += 1;
        } else {
            votes.crit_rate += 1;
        }

        me.points -= 1;
    }
}
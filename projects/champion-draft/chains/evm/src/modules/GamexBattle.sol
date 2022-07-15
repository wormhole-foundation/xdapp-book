// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {GameHelpers} from "../helpers/GameHelpers.sol";
import {GameLib} from "../lib/GameLib.sol";

contract GamexBattle is GameHelpers {

    event battleEvent(uint256 damageByHash, uint256 damage);
    event battleOutcome(uint256 winnerHash, uint256 loserHash, uint64 vaa);

    function crossChainBattle(uint256 myChampionHash, bytes memory encodedMsg)
        public
        checkRounds(GameLib.ActionType.BATTLE)
    {
        string memory payload;
        try messenger.receiveEncodedMsg(encodedMsg) returns (string memory p) {
            payload = p;
        } catch {
            revert("Unable to receive encoded message vaa.");
        }

        GameLib.Champion memory me = champions[myChampionHash];
        GameLib.Champion memory opponent = decodeIdVaa(bytes(payload));

        bytes32 random = rand(msg.sender);

        battle(me, opponent, random);
    }

    // function nativeChainBattle(
    //     uint256 myChampionHash,
    //     uint256 opponentChampionHash
    // ) public checkRounds(GameLib.ActionType.BATTLE) {
    //     GameLib.Champion memory me = champions[myChampionHash];
    //     GameLib.Champion memory opponent = champions[opponentChampionHash];

    //     bytes32 random = rand(msg.sender);
    //     battle(me, opponent, random);
    // }

    function battle(
        GameLib.Champion memory a,
        GameLib.Champion memory b,
        bytes32 random
    ) private {
        GameLib.ChampionStats memory aStats = a.stats;
        GameLib.ChampionStats memory bStats = b.stats;
        if (a.round + 1 < curRound || b.round + 1 < curRound) {
            // trying to fight an outdated champion
            revert("Not allowed to fight an outdated champion");
        }
        if (
            (aStats.level > bStats.level && aStats.level - bStats.level > 3) ||
            (bStats.level > aStats.level && bStats.level - aStats.level > 3)
        ) {
            revert(
                "Not allowed to battle champion with greater than 3 level difference."
            );
        }

        uint256 damageByA;
        uint256 damageByB;

        // idea: use 1 byte (0-255) as random. determine the threshold for event to trigger
        uint32 a_threshold_to_hit = (aStats.speed * 0xff) / (aStats.speed + bStats.speed);

        uint32 a_threshold_to_crit = (aStats.speed * 0xff) / 100;
        uint32 b_threshold_to_crit = (bStats.speed * 0xff) / 100;

        for (uint256 i = 0; i < GameLib.TURNS; i++) {
            if (byteToUint32(random[i]) < a_threshold_to_hit) {
                // a successful hit
                uint256 damage;

                // damage multiplier is a random number between 257 and 512
                uint32 damageMultiplier = byteToUint32(rand(msg.sender)[31]) +
                    257;
                if (byteToUint32(random[31 - i]) < a_threshold_to_crit) {
                    damage =
                        (aStats.attack * 2 * damageMultiplier) /
                        bStats.defense /
                        512;
                } else {
                    damage = (aStats.attack * damageMultiplier) / bStats.defense / 512;
                }

                emit battleEvent(a.championHash, damage);
                damageByA += damage;
            } else {
                // b successful hit
                uint256 damage;
                uint32 damageMultiplier = byteToUint32(rand(msg.sender)[31]) +
                    257;

                if (byteToUint32(random[31 - i]) < b_threshold_to_crit) {
                    damage =
                        (bStats.attack * 2 * damageMultiplier) /
                        aStats.defense /
                        512;
                } else {
                    damage = (bStats.attack * damageMultiplier) / aStats.defense / 512;
                }

                emit battleEvent(b.championHash, damage);
                damageByB += damage;
            }
        }

        GameLib.BattleOutcome memory outcome;
        if (damageByA >= damageByB) {
            outcome.winnerHash = a.championHash;
            outcome.loserHash = b.championHash;

            outcome.winnerXP = uint32(
                (damageByA * 50) /
                    (damageByA + damageByB)
            );
        } else {
            outcome.winnerHash = b.championHash;
            outcome.loserHash = a.championHash;
            outcome.winnerXP = uint32(
                (damageByB * 50) /
                    (damageByA + damageByB)
            );

        }
        
        outcome.loserXP = 50 - outcome.winnerXP;
        outcome.winnerXP += 25; // bonus for winning
        outcome.loserXP += 8;   // bonus for playing
        outcome.timestamp = block.timestamp;

        bytes memory encodedOutcome = abi.encode(outcome);
        uint64 seq = messenger.sendMsg(encodedOutcome);

        emit battleOutcome(outcome.winnerHash, outcome.loserHash, seq);
    }

    function claimXP(uint256 myChampionHash, bytes memory encodedMsg)
        public
        checkRounds(GameLib.ActionType.REGISTER)
    {
        (string memory payload, bytes32 vm_hash) = messenger
            .receiveEncodedMsgOnce(encodedMsg);

        GameLib.BattleOutcome memory b = abi.decode(bytes(payload), (GameLib.BattleOutcome));

        if (
            !(b.winnerHash == myChampionHash ||
                b.loserHash == myChampionHash)
        ) {
            revert(
                "The champion you entered is not impacted from this battle."
            );
        }

        if (championsClaimedXP[myChampionHash][vm_hash]) {
            revert("This champion has already claimed the XP for the battle.");
        }

        championsClaimedXP[myChampionHash][vm_hash] = true;
        GameLib.ChampionStats storage myChampionStats = champions[myChampionHash].stats;
        if (myChampionHash == b.winnerHash) {
            myChampionStats.xp += b.winnerXP;
        } else {
            myChampionStats.xp += b.loserXP;
        }

        while (myChampionStats.xp >= requiredXPtoLevelUp(myChampionStats.level)) {
            myChampionStats.xp -= requiredXPtoLevelUp(myChampionStats.level);
            myChampionStats.level += 1;
            myChampionStats.upgradePoints += 1;
        }
    }

    /**
    choice will be either 1,2,3,4 representing attack, defense, speed, crit rate respectfully
     */
    function upgrade(uint256 myChampionHash, uint8 choice)
        public
        checkRounds(GameLib.ActionType.UPGRADE)
    {
        GameLib.Champion storage myChampion = champions[myChampionHash];
        require(myChampion.owner == msg.sender);

        if (myChampion.stats.upgradePoints == 0) {
            revert("Your champion does not have any upgrade points.");
        }
        if (choice > 4) {
            revert("Invalid choice.");
        }
        if ((getUpgrades(myChampionHash) >> (4 - choice)) & 0x01 == 0) {
            revert(
                "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
            );
        }
        if (!isMostVotes(choice, myChampion)) {
            revert(
                "You are not allowed to upgrade that stat since it does not have enough votes. "
            );
        }

        GameLib.ChampionStats storage stats = myChampion.stats;

        if (choice == 1) {
            stats.attack += 5;
        } else if (choice == 2) {
            stats.defense += 2;
        } else if (choice == 3) {
            stats.speed += 5;
        } else {
            stats.crit_rate += 8;
        }

        GameLib.AudienceVotes memory newVotes;
        myChampion.votes = newVotes;

        stats.upgradePoints -= 1;
    }
}
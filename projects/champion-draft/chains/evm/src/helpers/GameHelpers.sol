pragma solidity ^0.8.13;
import {GameStorage} from "./GameStorage.sol";
import {GameLib} from "../lib/GameLib.sol";


contract GameHelpers is GameStorage {
    modifier checkRounds(GameLib.ActionType r) {
        if (block.timestamp < roundStart) {
            revert(
                "You are not allowed to perform actions outside the play time."
            );
        }
        uint256 timePassed = block.timestamp - roundStart;
        if (timePassed > GameLib.ROUND_LENGTH) {
            curRound += uint32(timePassed / GameLib.ROUND_LENGTH);
            roundStart = block.timestamp;
        }
        if (r == GameLib.ActionType.REGISTER) {
            _;
        } else {
            // even round means battling round
            if (curRound % 2 == 0 && r != GameLib.ActionType.BATTLE) {
                // upgrade round, not allowed to battle
                revert(
                    "You are not allowed to upgrade champions during battle round."
                );
            }
            // odd round means upgrade round
            if (curRound % 2 == 1 && r != GameLib.ActionType.UPGRADE) {
                // upgrade round, not allowed to battle
                revert(
                    "You are not allowed to battle champions during upgrade round."
                );
            }
            _;
        }
    }

    

    function getUpgrades(uint256 myChampionHash) public view returns (uint8) {
        GameLib.Champion memory myChampion = champions[myChampionHash];

        if (myChampion.owner == address(0)) {
            return 0;
        }

        uint32 curUpgradeLocation = myChampion.stats.level - myChampion.stats.upgradePoints;

        bytes memory hashBytes = abi.encodePacked(myChampionHash);
        if (curUpgradeLocation % 2 == 0) {
            return uint8(hashBytes[curUpgradeLocation / 2] >> 4) & 0xf;
        } else {
            return uint8(hashBytes[curUpgradeLocation / 2]) & 0xf;
        }
    }

    function requiredXPtoLevelUp(uint32 level) public pure returns (uint32) {
        if (level == 63) return 100000000;
        return level * 100;
    }


    // function getStats(uint256 myChampionHash)
    //     public
    //     view
    //     returns (
    //         uint32,
    //         uint32,
    //         uint32,
    //         uint32
    //     )
    // {
    //     GameLib.ChampionStats memory me = champions[myChampionHash].stats;
    //     return (me.attack, me.defense, me.speed, me.crit_rate);
    // }

    function getTimeLeftInRound() public view returns (uint32) {
        uint timePassed = block.timestamp - roundStart;
        if (timePassed >= GameLib.ROUND_LENGTH) {
            return 0;
        }
        return uint32(GameLib.ROUND_LENGTH - timePassed);
    }


    /**
    Generates a random number from [0, n-1]. Security attack: another contract can implement this method and call 
    this method at the same time they submit a battle to determine the random number. 
     */
    function rand(address msg_sender) public returns (bytes32) {
        nonce += 1;
        return
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                        block.difficulty +
                        ((
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                        ) / (block.timestamp)) +
                        block.gaslimit +
                        ((uint256(keccak256(abi.encodePacked(msg_sender)))) /
                            (block.timestamp)) +
                        block.number +
                        nonce
                )
            );
    }

    function getChampionHash(address _erc721Contract, uint256 _nft)
        public
        pure
        returns (bytes32)
    {
        return championHash(abi.encodePacked(_erc721Contract, _nft));
    }

    function championHash(bytes memory c) public pure returns (bytes32) {
        return sha256(c);
    }

    // TODO: make function private after testing
    function mintIdVaa(GameLib.Champion memory c) public pure returns (bytes memory) {
        return abi.encode(c);
    }

    function decodeIdVaa(bytes memory b)
        public
        pure
        returns (GameLib.Champion memory c)
    {
        c = abi.decode(b, (GameLib.Champion));
    }

    function byteToUint32(bytes1 b) public pure returns (uint32) {
        return uint32(uint8(b));
    }

    function isMostVotes(uint8 choice, GameLib.Champion memory c) public pure returns (bool) {
        uint32 stat;
        if (choice == 1) {
            stat = c.votes.attack;
        } else if (choice == 2) {
            stat = c.votes.defense;
        } else if (choice == 3) {
            stat = c.votes.speed;
        } else {
            stat = c.votes.crit_rate;
        }

        if (stat >= c.votes.attack && stat >= c.votes.defense && stat >= c.votes.speed && stat >= c.votes.crit_rate) {
            return true;
        }

        return false;
    }
}
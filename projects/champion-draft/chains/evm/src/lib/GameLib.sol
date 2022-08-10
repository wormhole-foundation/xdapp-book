pragma solidity ^0.8.13;

library GameLib {
    struct ChampionStats {
        uint32 attack;
        uint32 defense;
        uint32 speed;
        uint32 crit_rate;
        uint32 level;
        uint32 xp;
        uint32 upgradePoints;
    }

    struct AudienceVotes {
        uint32 attack;
        uint32 defense;
        uint32 speed;
        uint32 crit_rate;
    }

    struct Champion {
        uint256 championHash;
        address owner;
        uint64 vaaSeq;
        uint32 round;
        ChampionStats stats;
        AudienceVotes votes;
        string uri;
    }

    struct BattleOutcome {
        uint256 winnerHash;
        uint256 loserHash;
        uint32 winnerXP;
        uint32 loserXP;
        uint256 timestamp;
    }

    struct AudienceMember {
        uint256 currentDraft;
        uint256 timestamp;
        uint256 points;
    }

    // current max turns allowed: 15
    uint256 constant TURNS = 10;
    // round length is 5 minutes
    uint256 constant ROUND_LENGTH = 300;

    enum ActionType {
        BATTLE,
        UPGRADE,
        REGISTER
    }
}

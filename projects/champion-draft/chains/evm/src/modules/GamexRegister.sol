// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import "openzeppelin-contracts/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {GameHelpers} from "../helpers/GameHelpers.sol";
import {GameLib} from "../lib/GameLib.sol";

contract GamexRegister is GameHelpers {
    event championRegistered(uint256 championHash, uint64 vaa);

    /**
    
    Returns uint: the champion hash
     */
    function registerNFT(address _erc721Contract, uint256 _nft)
        public
        checkRounds(GameLib.ActionType.REGISTER)
        returns (uint256)
    {
        // require nft collection to support metadata IERC721 metadata extension
        require(
            IERC165(_erc721Contract).supportsInterface(0x5b5e139f),
            "NFT collection does not support metadata."
        );

        // assert ownership
        IERC721Metadata nftCollection = IERC721Metadata(_erc721Contract);
        require(
            nftCollection.ownerOf(_nft) == msg.sender,
            "You do not own this NFT"
        );

        string memory _uri = nftCollection.tokenURI(_nft);

        bytes32 myChampionHash = getChampionHash(_erc721Contract, _nft);
        // assert that the nft has not been registered yet
        require(
            champions[uint256(myChampionHash)].championHash !=
                uint256(myChampionHash),
            "NFT is already registered"
        );

        GameLib.Champion memory champion;
        champion.championHash = uint256(myChampionHash);
        champion.owner = msg.sender;
        champion.uri = _uri;
        champion.round = curRound;

        GameLib.ChampionStats memory championStats;
        championStats.attack = byteToUint32(myChampionHash[31] & 0x0F) / 2 + 5;
        championStats.defense =
            byteToUint32((myChampionHash[31] >> 4) & 0x0F) /
            5 +
            1;
        championStats.speed = byteToUint32(myChampionHash[30] & 0x0F) + 1;
        championStats.crit_rate =
            byteToUint32((myChampionHash[30] >> 4) & 0x0F) +
            10;
        championStats.level = 1;
        championStats.upgradePoints = 1;

        champion.stats = championStats;

        bytes memory b = mintIdVaa(champion);
        // emit IdVAA(b);
        uint64 seq = messenger.sendMsg(b);
        champion.vaaSeq = seq;
        champions[champion.championHash] = champion;

        emit championRegistered(champion.championHash, seq);
        return champion.championHash;
    }

    function optIn(uint256 myChampionHash) public checkRounds(GameLib.ActionType.REGISTER) {
        GameLib.Champion storage myChampion = champions[myChampionHash];
        require(myChampion.owner == msg.sender);

        myChampion.round = curRound+1;
        bytes memory b = mintIdVaa(myChampion);
        uint64 seq = messenger.sendMsg(b);
        myChampion.vaaSeq = seq;

        emit championRegistered(myChampionHash, seq);
    }
}
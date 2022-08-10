// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import {Surl} from "surl/Surl.sol";


import "src/CoreGame.sol";

contract CoreGameTest is Test {
    using Surl for *;

    CoreGame game;
    ERC721PresetMinterPauserAutoId nftCollection;
    address admin;
    address user1;
    address user2;
    address aud;

    string public constant WORMHOLE_URL = "http://localhost:7071/v1/signed_vaa/2/";

    function setUp() public {
        // run test with avalanche fuji testnet forge test -vvvv --fork-url https://api.avax-test.network/ext/bc/C/rpc
        // game = new CoreGame(
        //     address(0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C)
        // );

        // run test with local evm0 testnet forge test --fork-url http://localhost:8545
        game = new CoreGame(
            address(0xC89Ce4735882C9F0f0FE26686c53074E09B0D550)
        );
        nftCollection = new ERC721PresetMinterPauserAutoId(
            "bread",
            "B",
            "https://cloudflare-ipfs.com/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/"
        );
        admin = address(this);
        user1 = address(0x100);
        user2 = address(0x200);
        aud = address(0x300);

        nftCollection.mint(user1);
        nftCollection.mint(user1);
        nftCollection.mint(user1);
        nftCollection.mint(user1);
        nftCollection.mint(user2);
        nftCollection.mint(user2);
        nftCollection.mint(user2);
        nftCollection.mint(user2);
    }

    function testRegister() public {
        // user 1
        vm.prank(user1);
        uint256 c1 = game.registerNFT(address(nftCollection), 0);

        // TODO: verify bytes are on wormhole with SURL

        // fail bad id
        vm.expectRevert("ERC721: invalid token ID");
        vm.prank(user1);
        game.registerNFT(address(nftCollection), 200);
        vm.expectRevert("You do not own this NFT");
        vm.prank(user1);
        game.registerNFT(address(nftCollection), 5);

        // fail double register
        vm.expectRevert("NFT is already registered");
        vm.prank(user1);
        game.registerNFT(address(nftCollection), 0);


        vm.prank(aud);
        game.registerAudienceMember(c1);
    }

    function testBattle() public {
        // user 1
        vm.prank(user1);
        uint256 c1 = game.registerNFT(address(nftCollection), 2);

        vm.prank(user2);
        uint256 c2 = game.registerNFT(address(nftCollection), 5);

        // TODO: reimplement nativeChainBattle when contract sizes are smaller
        // vm.prank(user1);
        // game.nativeChainBattle(c1, c2);

        // test that a bad vaa fails
        bytes memory bad = "aoihgasfasghafdhadf";
        vm.expectRevert("Unable to receive encoded message vaa.");
        game.crossChainBattle(0, bad);
    }

    function testUpgrades() public {
        game.setRound(1);
        vm.startPrank(user1);
        uint256 c1 = game.registerNFT(address(nftCollection), 1);
        console.log(c1);

        // TODO: reimplement helper function when contract size is reduced
        // (, uint32 orig_def, , ) = game.getStats(c1);

        uint8 upgrades = game.getUpgrades(c1);
        console.log(upgrades);
        // 2 and 4 should be valid upgrades

        vm.expectRevert(
            bytes(
                "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
            )
        );
        game.upgrade(c1, 0);
        vm.expectRevert(
            bytes(
                "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
            )
        );
        game.upgrade(c1, 1);
        vm.expectRevert(
            bytes(
                "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
            )
        );
        game.upgrade(c1, 3);

        game.upgrade(c1, 2);
        // (, uint32 def, , ) = game.getStats(c1);
        // assertEq(def, orig_def + 2);

        vm.expectRevert(
            bytes("Your champion does not have any upgrade points.")
        );
        game.upgrade(c1, 4);
    }

    function testRounds() public {
        vm.prank(user1);
        vm.expectRevert(
            "You must be the owner of the contract to modify rounds!"
        );
        game.setRoundStart(2657034676);
        vm.prank(user1);
        vm.expectRevert(
            "You must be the owner of the contract to modify rounds!"
        );
        game.setRound(2);

        // round starts years from now
        game.setRoundStart(2657034676);

        vm.prank(user1);
        vm.expectRevert(
            "You are not allowed to perform actions outside the play time."
        );
        game.registerNFT(address(nftCollection), 2);

        game.setRound(0);

        vm.prank(user1);
        uint256 c1 = game.registerNFT(address(nftCollection), 1);
        vm.prank(user2);
        uint256 c2 = game.registerNFT(address(nftCollection), 5);

        vm.prank(user1);
        vm.expectRevert(
            "You are not allowed to upgrade champions during battle round."
        );
        game.upgrade(c1, 1);


        game.setRound(1);

        // vm.prank(user1);
        // vm.expectRevert(
        //     "You are not allowed to battle champions during upgrade round."
        // );
        // game.nativeChainBattle(c1, c2);
        vm.prank(user1);
        vm.expectRevert(
            "You are not allowed to battle champions during upgrade round."
        );
        game.crossChainBattle(c1, "sfasdfsad");

        game.getTimeLeftInRound();
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "openzeppelin-contracts/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";
import "src/CoreGame.sol";

contract CoreGameTest is Test {
    CoreGame game;
    ERC721PresetMinterPauserAutoId nftCollection;
    address admin;
    address user1;
    address user2;
    address aud;

    function setUp() public {
        // avalanche fuji testnet
        // run test with forge test -vvvv --fork-url https://api.avax-test.network/ext/bc/C/rpc
        game = new CoreGame(
            address(0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C)
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

        // ( , address owner, , , , , , , , , , ) = game.champions(c1);

        // assertEq(owner, user1);
        // assertEq(uri, "https://cloudflare-ipfs.com/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/0");
    }

    // function testBattle() public {
    //     // user 1
    //     vm.prank(user1);
    //     uint256 c1 = game.registerNFT(address(nftCollection), 2);

    //     vm.prank(user2);
    //     uint256 c2 = game.registerNFT(address(nftCollection), 5);

    //     vm.prank(user1);
    //     game.nativeChainBattle(c1, c2);

    //     // test that a bad vaa fails
    //     bytes memory bad = "aoihgasfasghafdhadf";
    //     vm.expectRevert("Unable to receive encoded message vaa.");
    //     game.crossChainBattle(0, bad);
    // }

    // function testUpgrades() public {
    //     game.setRound(1);
    //     vm.startPrank(user1);
    //     uint256 c1 = game.registerNFT(address(nftCollection), 1);
    //     console.log(c1);

    //     (, uint32 orig_def, , ) = game.getStats(c1);

    //     uint8 upgrades = game.getUpgrades(c1);
    //     console.log(upgrades);
    //     // 2 and 4 should be valid upgrades

    //     vm.expectRevert(
    //         bytes(
    //             "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
    //         )
    //     );
    //     game.upgrade(c1, 0);
    //     vm.expectRevert(
    //         bytes(
    //             "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
    //         )
    //     );
    //     game.upgrade(c1, 1);
    //     vm.expectRevert(
    //         bytes(
    //             "You are not allowed to upgrade that stat. See getUpgrades for available upgrades."
    //         )
    //     );
    //     game.upgrade(c1, 3);
    //     // vm.expectRevert(bytes("You are not allowed to upgrade that stat. See getUpgrades for available upgrades."));
    //     // game.upgrade(c1, 5);

    //     game.upgrade(c1, 2);
    //     (, uint32 def, , ) = game.getStats(c1);
    //     assertEq(def, orig_def + 2);

    //     vm.expectRevert(
    //         bytes("Your champion does not have any upgrade points.")
    //     );
    //     game.upgrade(c1, 4);
    // }

    // function testRounds() public {
    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You must be the owner of the contract to modify rounds!"
    //     );
    //     game.setRoundStart(2657034676);
    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You must be the owner of the contract to modify rounds!"
    //     );
    //     game.setRound(2);

    //     // round starts years from now
    //     game.setRoundStart(2657034676);

    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You are not allowed to perform actions outside the play time."
    //     );
    //     game.registerNFT(address(nftCollection), 2);

    //     game.setRound(0);

    //     vm.prank(user1);
    //     uint256 c1 = game.registerNFT(address(nftCollection), 1);
    //     vm.prank(user2);
    //     uint256 c2 = game.registerNFT(address(nftCollection), 5);

    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You are not allowed to upgrade champions during battle round."
    //     );
    //     game.upgrade(c1, 1);


    //     game.setRound(1);


    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You are not allowed to battle champions during upgrade round."
    //     );
    //     game.nativeChainBattle(c1, c2);
    //     vm.prank(user1);
    //     vm.expectRevert(
    //         "You are not allowed to battle champions during upgrade round."
    //     );
    //     game.crossChainBattle(c1, "sfasdfsad");

    //     game.getTimeLeftInRound();
    // }
}

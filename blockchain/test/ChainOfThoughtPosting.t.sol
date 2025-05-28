// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/src/Test.sol";
import {IChainOfThought, PostStats} from "../src/IChainOfThought.sol";
import {IThoughtToken} from "../src/IThoughtToken.sol";
import {ThoughtToken} from "../src/ThoughtToken.sol";
import {ChainOfThought} from "../src/ChainOfThought.sol";
import {ChainOfThoughtTestBase} from "./ChainOfThoughtTestBase.sol";

contract ChainOfThoughtPostingTest is ChainOfThoughtTestBase {

    bytes private constant ICON_SAMPLE = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000464646b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000b4b4b4b4b4b4b4b4b4000000000000000000000000000000b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000464646b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000b4b4b4b4b4b4000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000464646464646b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000464646464646464646b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000464646464646464646464646464646464646b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000464646464646464646464646464646000000b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4b4000000000000000000b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000464646464646464646000000000000000000b4b4b4b4b4b4b4b4b4b4b4b4464646464646000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000464646464646464646464646464646000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000464646464646464646464646000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4b4b4b4b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4b4b4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    function test_postCost() public {
        vm.startPrank(author1, author1);

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";
        bytes memory iconEmpty = new bytes(0);
        bytes32 ps = bytes32(0);

        uint postCostNoIcon = chainOfThought.estimatePostCost(title, content, iconEmpty, ps);
        uint postCostIcon = chainOfThought.estimatePostCost(title, content, ICON_SAMPLE, ps);

        assertGt(postCostNoIcon, 0, "Post cost should not be zero");
        assertGt(postCostIcon, postCostNoIcon, "Post cost with icon should be greater than without icon");

        vm.stopPrank();
    }

    function test_invalidIconSize() public withAuthorBalance(author1, 1000000) {
        vm.startPrank(author1, author1);
        vm.expectRevert();

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";
        bytes memory invalidIcon = abi.encodePacked(ICON_SAMPLE, "0");
        bytes32 ps = bytes32(0);

        chainOfThought.publishPost(title, content, invalidIcon, ps);

        vm.stopPrank();
    }

    function test_postSimple() public withAuthorBalance(author1, 1000000) {
        vm.startPrank(author1, author1);

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";

        bytes memory icon = new bytes(0);
        bytes32 ps = bytes32(0);

        uint initialBalance = chainOfThought.getTokenBalance();
        uint postCost = chainOfThought.estimatePostCost(title, content, icon, ps);
        bytes32 postHash = chainOfThought.publishPost(title, content, icon, ps);

        // Verify the post was created
        PostStats memory stats = chainOfThought.getPostStats(postHash);
        bytes32 existingPostHash = chainOfThought.getPostHash(title, content, icon, ps);

        assertEq32(postHash, existingPostHash, "Post hash should match the created post hash");
        assertEq(chainOfThought.getTokenBalance(), initialBalance - postCost, "Token balance should decrease by post cost");

        vm.stopPrank();
    }

    function test_postPsOwnPost() public withAuthorBalance(author1, 1000000) {
        vm.startPrank(author1, author1);

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";
        bytes memory icon = new bytes(0);
        bytes32 ps = bytes32(0);

        bytes32 postHash1 = chainOfThought.publishPost(title, content, icon, ps);
        bytes32 postHash2 = chainOfThought.publishPost(title, content, icon, postHash1);

        PostStats memory stats1 = chainOfThought.getPostStats(postHash1);
        PostStats memory stats2 = chainOfThought.getPostStats(postHash2);

        assertEq(stats1.references.length, 1, "Post should have one follow-up reference");
        assertEq(stats1.references[0], postHash2, "Reference should match the second post hash");
        assertEq(stats2.references.length, 0, "Second post should have no references");
        assertEq32(stats2.referencedPostHash, postHash1, "Post2 should reference Post1");

        vm.stopPrank();
    }

    function test_postPsForeignPost() public withAuthorBalance(author1, 1000000) withAuthorBalance(author2, 1000000) {

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";
        bytes memory icon = new bytes(0);
        bytes32 ps = bytes32(0);

        vm.startPrank(author1, author1);
        bytes32 postHash1 = chainOfThought.publishPost(title, content, icon, ps);
        vm.stopPrank();

        vm.startPrank(author2, author2);
        chainOfThought.addPostToAccessList(postHash1);
        bytes32 postHash2 = chainOfThought.publishPost(title, content, icon, postHash1);

        PostStats memory stats1 = chainOfThought.getPostStats(postHash1);
        PostStats memory stats2 = chainOfThought.getPostStats(postHash2);

        assertEq(stats1.references.length, 1, "Post should have one follow-up reference");
        assertEq(stats1.references[0], postHash2, "Reference should match the second post hash");
        assertEq(stats2.references.length, 0, "Second post should have no references");
        assertEq32(stats2.referencedPostHash, postHash1, "Post2 should reference Post1");

        vm.stopPrank();
    }

    function test_postPsInvalidAccess() public withAuthorBalance(author1, 1000000) withAuthorBalance(author2, 1000000) {

        string memory title = "A Thought";
        string memory content = "I think, therefore I am.";
        bytes memory icon = new bytes(0);
        bytes32 ps = bytes32(0);

        vm.startPrank(author1, author1);
        bytes32 postHash1 = chainOfThought.publishPost(title, content, icon, ps);
        vm.stopPrank();

        vm.startPrank(author2, author2);
        vm.expectRevert(); // author 2 may not reference the post because it's not in the access list
        bytes32 postHash2 = chainOfThought.publishPost(title, content, icon, postHash1);
        vm.stopPrank();
    }

    function test_addToAccessList() public withAuthorBalance(author1, 1000000) withAuthorBalance(author2, 1000000) withPostExisting(author2) {
        vm.startPrank(author1, author1);

        bytes32 postHash = chainOfThought.allPosts()[0];
        uint initialBalance = chainOfThought.getTokenBalance();
        uint authorBalance = thoughtToken.balanceOf(author2);
        uint accessPrice = chainOfThought.getAccessPrice();

        chainOfThought.addPostToAccessList(postHash);
        assertEq(initialBalance - accessPrice, chainOfThought.getTokenBalance(), "Token balance should decrease by access list cost");
        assertEq(authorBalance + accessPrice, thoughtToken.balanceOf(author2), "Token balance should increase for author");

        bytes32[] memory accessList = chainOfThought.userAccessedPosts();
        assertEq(accessList.length, 1, "Access list should contain one post");
        assertEq32(accessList[0], postHash, "Accessed post hash should match the post hash");

        vm.stopPrank();
    }

    function test_alreadyInAccessList() public
        withAuthorBalance(author1, 1000000)
        withAuthorBalance(author2, 1000000)
        withPostExisting(author2)
    {
        vm.startPrank(author1, author1);

        bytes32 postHash = chainOfThought.allPosts()[0];
        chainOfThought.addPostToAccessList(postHash);

        vm.expectRevert();
        chainOfThought.addPostToAccessList(postHash);

        vm.stopPrank();
    }

    function test_cantAddOwnToAccessList() public withAuthorBalance(author1, 1000000) withPostExisting(author1) {
        vm.startPrank(author1, author1);

        bytes32 postHash = chainOfThought.allPosts()[0];
        vm.expectRevert();
        chainOfThought.addPostToAccessList(postHash);
        vm.stopPrank();
    }

    function test_addToFavoritesList() public withAuthorBalance(author1, 1000000) withAuthorBalance(author2, 1000000) withPostExisting(author2) {
        vm.startPrank(author1, author1);

        bytes32 postHash = chainOfThought.allPosts()[0];
        chainOfThought.addPostToAccessList(postHash);

        uint initialBalance = chainOfThought.getTokenBalance();
        uint favoritePrice = chainOfThought.getFavoritePrice();
        chainOfThought.addPostToFavorites(postHash);
        assertEq(initialBalance - favoritePrice, chainOfThought.getTokenBalance(), "Token balance should decrease by favorite add cost");

        bytes32[] memory favoriteList = chainOfThought.userFavoritePosts();
        assertEq(favoriteList.length, 1, "Favorites list should contain one post");
        assertEq32(favoriteList[0], postHash, "Favorites post hash should match the post hash");

        PostStats memory stats = chainOfThought.getPostStats(postHash);
        assertEq(stats.favorites, 1, "Post should have one favorite");

        vm.stopPrank();
    }

    function test_addToFavoritesInvalidAccess() public
        withAuthorBalance(author1, 1000000)
        withAuthorBalance(author2, 1000000)
        withPostExisting(author2)
    {
        vm.startPrank(author1, author1);
        bytes32 postHash = chainOfThought.allPosts()[0];

        vm.expectRevert();
        chainOfThought.addPostToFavorites(postHash);

        vm.stopPrank();
    }

    function test_alreadyInFavoritesList() public
        withAuthorBalance(author1, 1000000)
        withAuthorBalance(author2, 1000000)
        withPostExisting(author2)
    {
        vm.startPrank(author1, author1);

        bytes32 postHash = chainOfThought.allPosts()[0];
        chainOfThought.addPostToAccessList(postHash);
        chainOfThought.addPostToFavorites(postHash);

        vm.expectRevert();
        chainOfThought.addPostToFavorites(postHash);

        vm.stopPrank();
    }

    function test_hidePost() public
        withAuthorBalance(author1, 1000000)
        withPostExisting(author1)
        withModerator()
    {
        vm.startPrank(moderator, moderator);

        bytes32 postHash = chainOfThought.allPosts()[0];
        PostStats memory statsBefore = chainOfThought.getPostStats(postHash);
        assertFalse(statsBefore.hidden, "Post should not be hidden initially");

        chainOfThought.flagPostAsHidden(postHash);
        vm.expectRevert();
        chainOfThought.getPostStats(postHash);

        vm.stopPrank();
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "../src/IChainOfThought.sol";
import "forge-std/src/Test.sol";
import {ChainOfThoughtTestBase} from "./ChainOfThoughtTestBase.sol";
import {ChainOfThought} from "../src/ChainOfThought.sol";
import {IChainOfThought, IChainOfThoughtEvents} from "../src/IChainOfThought.sol";
import {IThoughtToken} from "../src/IThoughtToken.sol";
import {ThoughtToken} from "../src/ThoughtToken.sol";
import {Strings} from "../dependencies/@openzeppelin-contracts-5.3.0/utils/Strings.sol";

contract ChainOfThoughtUserInteractionTest is ChainOfThoughtTestBase, IChainOfThoughtEvents {

    function test_rewardInitiallyAvailable() public {
        vm.startPrank(author, author);
        assertTrue(chainOfThought.rewardAvailable(), "Reward should be available initially");
        vm.stopPrank();
    }

    function test_rewardIncreasesBalance() public withAuthorBalance(100) {
        vm.startPrank(author, author);
        uint initialBalance = thoughtToken.balanceOf(author);
        uint rewardValue = chainOfThought.getRewardAmount();
        chainOfThought.claimReward();

        uint newBalance = thoughtToken.balanceOf(author);
        assertEq(newBalance, initialBalance + rewardValue, "Reward should increase balance");
        vm.stopPrank();
    }

    function test_rewardNotAvailableAfterClaim() public {
        vm.startPrank(author, author);
        chainOfThought.claimReward();
        assertFalse(chainOfThought.rewardAvailable(), "Reward should not be available after claim");
        vm.stopPrank();
    }

    function test_rewardAvailableAgainAfterInterval() public {
        vm.startPrank(author, author);
        chainOfThought.claimReward();

        // Simulate passage of time
        vm.warp(block.timestamp + chainOfThought.getRewardInterval());

        assertTrue(chainOfThought.rewardAvailable(), "Reward should be available again after interval");
        vm.stopPrank();
    }

    function test_aliasChangeRequiresBalance() public {
        vm.expectRevert();
        vm.startPrank(author, author);
        chainOfThought.changeAlias("newAlias");
        vm.stopPrank();
    }

    function test_aliasChangeDecreasesBalance() public withAuthorBalance(1000000) {
        vm.startPrank(author, author);
        uint initialBalance = thoughtToken.balanceOf(author);
        uint renamePrice = chainOfThought.getRenamePrice();
        require(renamePrice < initialBalance, "Test config mismatch: Initial balance should be greater than rename price");

        vm.expectEmit(false, false, false, true); /* event emitted */
        emit AliasChanged(author, "pondering_______poet");

        chainOfThought.changeAlias("pondering_______poet");

        uint newBalance = thoughtToken.balanceOf(author);
        assertEq(newBalance, initialBalance - renamePrice, "Alias change should decrease balance");
        assertTrue(Strings.equal("pondering_______poet", chainOfThought.getAlias()), "Alias should be updated");
        vm.stopPrank();
    }

    function test_getAliasWithFallback() public {
        vm.startPrank(author, author);
        string memory userAlias = chainOfThought.getAlias();
        assertEq(userAlias, Strings.toHexString(author), "Default alias should be address if not set");
        vm.stopPrank();
    }

    function test_buyTokensWithETH() public {
        vm.startPrank(author, author);
        vm.deal(author, 1 ether);
        uint initialBalance = thoughtToken.balanceOf(author);
        uint tokenPrice = chainOfThought.getTokenValue();
        uint ethAmount = tokenPrice * 100;

        vm.expectEmit(true, true, false, true); /* event emitted */
        emit UserBalanceChanged(author, initialBalance + 100);

        chainOfThought.buyTokens{value: ethAmount}();

        uint newBalance = thoughtToken.balanceOf(author);
        assertEq(newBalance, initialBalance + 100, "Token balance should increase after buying tokens");
        vm.stopPrank();
    }

    function test_balanceCheck() public withAuthorBalance(1000) {
        vm.startPrank(author, author);
        uint balance = chainOfThought.getTokenBalance();
        assertEq(balance, 1000, "Token balance should match the initial setup");
        vm.stopPrank();
    }
}
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
        vm.startPrank(author1, author1);
        assertTrue(chainOfThought.rewardAvailable(), "Reward should be available initially");
        vm.stopPrank();
    }

    function test_rewardIncreasesBalance() public withAuthorBalance(author1, 100) {
        vm.startPrank(author1, author1);
        uint initialBalance = thoughtToken.balanceOf(author1);
        uint rewardValue = chainOfThought.getRewardAmount();
        chainOfThought.claimReward();

        uint newBalance = thoughtToken.balanceOf(author1);
        assertEq(newBalance, initialBalance + rewardValue, "Reward should increase balance");
        vm.stopPrank();
    }

    function test_rewardEmitsEvent() public withAuthorBalance(author1, 100) {
        vm.startPrank(author1, author1);

        vm.expectEmit(false, false, false, false);
        emit UserBalanceChanged(author1, 0);

        chainOfThought.claimReward();
        vm.stopPrank();
    }

    function test_rewardNotAvailableAfterClaim() public {
        vm.startPrank(author1, author1);
        chainOfThought.claimReward();
        assertFalse(chainOfThought.rewardAvailable(), "Reward should not be available after claim");
        vm.stopPrank();
    }

    function test_rewardAvailableAgainAfterInterval() public {
        vm.startPrank(author1, author1);
        chainOfThought.claimReward();

        // Simulate passage of time
        vm.warp(block.timestamp + chainOfThought.getRewardInterval());

        assertTrue(chainOfThought.rewardAvailable(), "Reward should be available again after interval");
        vm.stopPrank();
    }

    function test_aliasChangeRequiresBalance() public {
        vm.expectRevert();
        vm.startPrank(author1, author1);
        chainOfThought.changeAlias("newAlias");
        vm.stopPrank();
    }

    function test_aliasChangeDecreasesBalance() public withAuthorBalance(author1, 1000000) {
        vm.startPrank(author1, author1);
        uint initialBalance = thoughtToken.balanceOf(author1);
        uint renamePrice = chainOfThought.getRenamePrice();
        require(renamePrice < initialBalance, "Test config mismatch: Initial balance should be greater than rename price");

        chainOfThought.changeAlias("pondering_______poet");

        uint newBalance = thoughtToken.balanceOf(author1);
        assertEq(newBalance, initialBalance - renamePrice, "Alias change should decrease balance");
        assertTrue(Strings.equal("pondering_______poet", chainOfThought.getAlias()), "Alias should be updated");
        vm.stopPrank();
    }

    function test_aliasChangeEmitsEvents() public withAuthorBalance(author1, 1000000) {
        vm.startPrank(author1, author1);

        vm.expectEmit(false, false, false, false); /* event emitted */
        emit AliasChanged(author1, "pondering_______poet");

        vm.expectEmit(false, false, false, false);
        emit UserBalanceChanged(author1, 0);

        chainOfThought.changeAlias("pondering_______poet");
        vm.stopPrank();
    }

    function test_getAliasWithFallback() public {
        vm.startPrank(author1, author1);
        string memory userAlias = chainOfThought.getAlias();
        assertEq(userAlias, Strings.toHexString(author1), "Default alias should be address if not set");
        vm.stopPrank();
    }

    function test_buyTokensWithETH() public {
        vm.startPrank(author1, author1);
        vm.deal(author1, 1 ether);
        uint initialBalance = thoughtToken.balanceOf(author1);
        uint tokenPrice = chainOfThought.getTokenValue();
        uint ethAmount = tokenPrice * 100;

        vm.expectEmit(true, true, false, false); /* event emitted */
        emit UserBalanceChanged(author1, initialBalance + 100);

        chainOfThought.buyTokens{value: ethAmount}();

        uint newBalance = thoughtToken.balanceOf(author1);
        assertEq(newBalance, initialBalance + 100, "Token balance should increase after buying tokens");
        vm.stopPrank();
    }

    function test_balanceCheck() public withAuthorBalance(author1, 1000) {
        vm.startPrank(author1, author1);
        uint balance = chainOfThought.getTokenBalance();
        assertEq(balance, 1000, "Token balance should match the initial setup");
        vm.stopPrank();
    }
}
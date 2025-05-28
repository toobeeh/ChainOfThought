// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/src/Test.sol";
import {IChainOfThought} from "../src/IChainOfThought.sol";
import {IThoughtToken} from "../src/IThoughtToken.sol";
import {ThoughtToken} from "../src/ThoughtToken.sol";
import {ChainOfThought} from "../src/ChainOfThought.sol";
import {ChainOfThoughtTestBase} from "./ChainOfThoughtTestBase.sol";

contract ChainOfThoughtSettingsTest is ChainOfThoughtTestBase {

    function test_addModerator() public withModerator {
        assertTrue(chainOfThought.isModerator(moderator), "Moderator should be added");
    }

    function test_removeModerator() public withModerator {
        vm.startPrank(owner, owner);
        chainOfThought.removeModerator(moderator);
        vm.stopPrank();
        assertFalse(chainOfThought.isModerator(moderator), "Moderator should be removed");
    }

    function test_negativeModeratorRoleCheck() public {
        vm.startPrank(owner, owner);
        assertFalse(chainOfThought.isModerator(author1), "Regular user should not be moderator");
        vm.stopPrank();
    }

    function test_setTokenValue() public withModerator {
        uint newTokenValue = 1 ether;
        vm.startPrank(moderator, moderator);
        chainOfThought.setTokenValue(newTokenValue);
        vm.stopPrank();

        uint currentTokenValue = chainOfThought.getTokenValue();
        assertEq(currentTokenValue, newTokenValue, "Token value should be updated");
    }


    function test_setAccessPrice() public withModerator {
        uint newAccessPrice = 1000;
        vm.startPrank(moderator, moderator);
        chainOfThought.setAccessPrice(newAccessPrice);
        vm.stopPrank();

        uint currentAccessPrice = chainOfThought.getAccessPrice();
        assertEq(currentAccessPrice, newAccessPrice, "Access price should be updated");
    }

    function test_setRenamePrice() public withModerator {
        uint newRenamePrice = 100000;
        vm.startPrank(moderator, moderator);
        chainOfThought.setRenamePrice(newRenamePrice);
        vm.stopPrank();

        uint currentRenamePrice = chainOfThought.getRenamePrice();
        assertEq(currentRenamePrice, newRenamePrice, "Rename price should be updated");
    }

    function test_setRewardInterval() public withModerator {
        uint newRewardInterval = 1 days;
        vm.startPrank(moderator, moderator);
        chainOfThought.setRewardInterval(newRewardInterval);
        vm.stopPrank();

        uint currentRewardInterval = chainOfThought.getRewardInterval();
        assertEq(currentRewardInterval, newRewardInterval, "Reward interval should be updated");
    }

    function test_setRewardAmount() public withModerator {
        uint newRewardAmount = 100;
        vm.startPrank(moderator, moderator);
        chainOfThought.setRewardAmount(newRewardAmount);
        vm.stopPrank();

        uint currentRewardAmount = chainOfThought.getRewardAmount();
        assertEq(currentRewardAmount, newRewardAmount, "Reward amount should be updated");
    }
}
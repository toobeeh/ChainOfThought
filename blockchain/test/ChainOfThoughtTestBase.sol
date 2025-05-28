// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/src/Test.sol";
import {IChainOfThought} from "../src/IChainOfThought.sol";
import {IThoughtToken} from "../src/IThoughtToken.sol";
import {ThoughtToken} from "../src/ThoughtToken.sol";
import {ChainOfThought} from "../src/ChainOfThought.sol";

contract ChainOfThoughtTestBase is Test {

    IThoughtToken internal thoughtToken;
    IChainOfThought internal chainOfThought;

    address internal owner;
    address internal moderator;
    address internal author1;
    address internal author2;

    function setUp() public {
        owner = vm.addr(0x1);
        moderator = vm.addr(0x2);
        author1 = vm.addr(0x3);
        author2 = vm.addr(0x4);

        vm.startPrank(owner, owner);
        thoughtToken = new ThoughtToken();
        chainOfThought = new ChainOfThought(address(thoughtToken));
        thoughtToken.allowSupervisorFor(address(chainOfThought));
        vm.stopPrank();
    }

    modifier withModerator() {
        vm.startPrank(owner, owner);
        chainOfThought.addModerator(moderator);
        vm.stopPrank();
        _;
    }

    modifier withAuthorBalance(address author, uint balance) {
        vm.startPrank(owner, owner);
        thoughtToken.mint(balance, author);
        vm.stopPrank();
        _;
    }

    modifier withPostExisting(address author) {
        vm.startPrank(author, author);
        bytes32 psHash = bytes32(0);
        bytes32 postHash = chainOfThought.publishPost("A poem", "I think, therefore I am.\nHow beautiful,\ntherefore defined by thoughts defining my being,\nI am only thinking in poems.", new bytes(0), psHash);
        vm.stopPrank();
        _;
    }
}

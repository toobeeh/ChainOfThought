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
    address internal author;

    function setUp() public {
        owner = vm.addr(0x1);
        moderator = vm.addr(0x2);
        author = vm.addr(0x3);

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

    modifier withAuthorBalance(uint balance) {
        vm.startPrank(owner, owner);
        thoughtToken.mint(balance, author);
        vm.stopPrank();
        _;
    }
}

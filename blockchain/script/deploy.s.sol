// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Script, console} from "forge-std/src/Script.sol";
import {ThoughtToken} from "../src/ThoughtToken.sol";
import {ChainOfThought} from "../src/ChainOfThought.sol";

contract BasicDeploymentScript {
    function deployContracts() public {
        ThoughtToken thoughtToken = new ThoughtToken();
        ChainOfThought chainOfThought = new ChainOfThought();
    }
}

// forge script script/Deploy.s.sol:Dev --broadcast -vvv
contract Dev is Script, BasicDeploymentScript {
    address private owner = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // first default account of anvil
    function setUp() public {}
    function run() public {
        vm.createSelectFork("dev");
        vm.startBroadcast(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80); // private key of above account
        deployContracts();
        vm.stopBroadcast();
    }
}

// forge script script/Deploy.s.sol:Lva --broadcast -vvv --private-key <private-key-from-metamask>
contract Lva is Script, BasicDeploymentScript {
    function setUp() public {}
    function run() public {
        vm.createSelectFork("lva");
        vm.startBroadcast();
        deployContracts();
        vm.stopBroadcast();
    }
}
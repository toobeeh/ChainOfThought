// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC223} from "./erc223/IERC223.sol";

interface IThoughtToken is IERC223 {

    /**
     * @dev adds `value` tokens to the `recipient` address and increases the total supply
     */
    function mint(uint value, address recipient) external returns (bool success);
}

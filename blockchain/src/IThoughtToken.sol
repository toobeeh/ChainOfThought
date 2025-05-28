// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC223} from "./erc223/IERC223.sol";

interface IThoughtToken is IERC223 {

    /**
     * @dev adds `value` tokens to the `recipient` address and increases the total supply
     */
    function mint(uint value, address recipient) external returns (bool success);

    /**
     * @dev deducts `value` tokens from the `target` address and decreases the total supply
     */
    function burn(uint value, address target) external returns (bool success);

    /**
     * @dev deducts `value` tokens from the `target` address and decreases the total supply
     */
    function transfer(uint value, address from, address to) external returns (bool success);

    /**
     * @dev gives an account access to mint, force transfer and burn tokens
     */
    function allowSupervisorFor(address account) external;

    /**
     * @dev revokes the mint, force transfer and burn access from an account
     */
    function disallowSupervisorFor(address account) external;
}

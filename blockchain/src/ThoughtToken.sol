// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IERC223Recipient} from "./erc223/IERC223Recipient.sol";
import {IERC223} from "./erc223/IERC223.sol";
import {IThoughtToken} from "./IThoughtToken.sol";
import {AccessControl} from "../dependencies/@openzeppelin-contracts-5.3.0/access/AccessControl.sol";

contract ThoughtToken is IThoughtToken, AccessControl {
    string private constant _name = "ThoughtToken";
    string private constant _symbol = "TT";
    uint8 private constant _decimals = 0;

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");
    bytes32 public constant SUPERVISOR_ROLE = keccak256("SUPERVISOR_ROLE");

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    constructor() {

        // Set up roles
        _setRoleAdmin(SUPERVISOR_ROLE, OWNER_ROLE);
        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
        _grantRole(OWNER_ROLE, msg.sender);
        _grantRole(SUPERVISOR_ROLE, msg.sender);
    }

    function allowSupervisorFor(address account) external onlyRole(OWNER_ROLE) {
        require(!hasRole(SUPERVISOR_ROLE, account), "Account already has MINTABLE_ROLE");
        _grantRole(SUPERVISOR_ROLE, account);
    }

    function disallowSupervisorFor(address account) external onlyRole(OWNER_ROLE) {
        require(hasRole(SUPERVISOR_ROLE, account), "Account does not have MINTABLE_ROLE");
        _revokeRole(SUPERVISOR_ROLE, account);
    }

    function name() public pure override returns (string memory)
    {
        return _name;
    }

    function symbol() public pure override returns (string memory)
    {
        return _symbol;
    }

    function decimals() public pure override returns (uint8)
    {
        return _decimals;
    }

    function totalSupply() public view override returns (uint256)
    {
        return _totalSupply;
    }

    function balanceOf(
        address who
    ) public view override returns (uint256)
    {
        return _balances[who];
    }

    function mint(
        uint256 value,
        address recipient
    ) external override onlyRole(SUPERVISOR_ROLE) returns (bool success)
    {
        require(recipient != address(0), "Cannot mint to zero address");

        _balances[recipient] += value;
        _totalSupply += value;

        bytes memory empty;
        emit Transfer(address(0), recipient, value, empty);
        return true;
    }

function burn(
        uint256 value,
        address target
    ) external override onlyRole(SUPERVISOR_ROLE) returns (bool success)
    {
        require(target != address(0), "Cannot burn from zero address");
        require(_balances[target] >= value, "Insufficient balance to burn");

        _balances[target] -= value;
        _totalSupply -= value;

        bytes memory empty;
        emit Transfer(target, address(0), value, empty);
        return true;
    }

    function transfer(
        address to,
        uint256 value
    ) external override returns (bool success)
    {
        bytes memory empty;
        return _transfer(msg.sender, to, value, empty);
    }

    function transfer(
        uint256 value,
        address from,
        address to
    ) external override returns (bool success)
    {
        bytes memory empty;
        return _transfer(from, to, value, empty);
    }

    function transfer(
        address to,
        uint256 value,
        bytes calldata data
    ) external override returns (bool success)
    {
        return _transfer(msg.sender, to, value, data);
    }

    function _transfer(
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal returns (bool success) {
        require(to != address(0), "Cannot transfer to zero address");
        require(_balances[from] >= value, "Insufficient balance");

        _balances[from] -= value;
        _balances[to] += value;

        emit Transfer(from, to, value, data);

        if (_isContract(to)) {
            IERC223Recipient(to).tokenReceived(from, value, data);
        }

        return true;
    }

    function _isContract(address _addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }
}

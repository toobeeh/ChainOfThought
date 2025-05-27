pragma solidity ^0.8.0;

/**
* @title Contract that will work with ERC-223 tokens.
 */

abstract contract IERC223Recipient {

    /**
     * @dev Standard ERC223 function that will handle incoming token transfers.
     *
     * @param _from  Token sender address.
     * @param _value Amount of tokens.
     * @param _data  Transaction metadata.
     */
    function tokenReceived(address _from, uint _value, bytes memory _data) public virtual;
}

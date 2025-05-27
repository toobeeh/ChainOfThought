// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IChainOfThought {

    // ======================
    // Contract Events
    event PostPublished(bytes32 indexed postHash, address indexed author);
    event PostAccessed(bytes32 indexed postHash, address indexed reader);
    event AliasChanged(address indexed user, bytes10 newAlias);
    event TokensPurchased(address indexed user, uint amount);

    // ======================
    // Management

    /**
    * @dev Get the address of the thought token contract
    */
    function getThoughtTokenContractAddress() external view returns (address);

    // role management for owner, not part of the UI
    function isModerator(address account) external view returns (bool);
    function removeModerator(address account) external;
    function addModerator(address account) external;

    // ======================
    // Contract Settings

    /**
    * @dev Set the eth value of one thought token
    */
    function setTokenValue(uint ethPerToken) external;

    /**
    * @dev Get the eth value of one thought token
    */
    function getTokenValue() external view returns (uint ethPerToken);

    /**
    * @dev Set the token cost to add a post to the personal access list
    */
    function setAccessPrice(uint tokensToAccess) external;

    /**
    * @dev Get the token cost to add a post to the personal access list
    */
    function getAccessPrice() external view returns (uint tokensToAccess);

    /**
    * @dev Set the price to change alias
    */
    function setRenamePrice(uint tokensToRename) external;

    /**
    * @dev Get the price to change alias
    */
    function getRenamePrice() external view returns (uint tokensToRename);


    /**
    * @dev Set the interval where token rewards are claimable
    */
    function setRewardInterval(uint intervalToRewards) external;

    /**
    * @dev Get the interval where token rewards are claimable
    */
    function getRewardInterval() external view returns (uint intervalToRewards);

    // ======================
    // Publishing Posts

    /**
    * @dev Publish a new post; costs tokens
    */
    function publishPost(string calldata title, string calldata content, bytes calldata icon, bytes32 psPostHash) external;

    /**
    * @dev Estimate the thought token cost of publishing a new post; does not change the state
    */
    function estimatePostCost(string calldata title, string calldata content, bytes calldata icon, bytes32 psPostHash) external view returns (uint);

    /**
    * @dev Get the hash of a post based on its content
    */
    function getPostHash(string calldata title, string calldata content, bytes calldata icon, bytes32 psPostHash) external view returns (uint);

    // ======================
    // Listing Access

    /**
    * @dev Get all post listing (title, author, icon, date)
    */
    function posts() external view returns (bytes32[] memory allPostHashes);

    /**
    * @dev Get all favorized posts
    */
    function favorites() external view returns (bytes32[] memory favoritePostHashes);

    /**
    * @dev Get all posts of the personal access list
    */
    function accessed() external view returns (bytes32[] memory accessedPostHashes);

    // ======================
    // Viewing Posts

    /**
    * @dev
    */
    function addPostToAccessList(uint postId) external; // adds the post to the personal access list; costs tokens

    /**
    * @dev
    */
    function addPostToFavorites(uint postId) external; // adds the post to the favorites; costs tokens

    /**
    * @dev
    */
    function flagPostAsDeleted(uint postId) external; // for moderators, will hide the post from the listing

    // ======================
    // User Interaction

    /**
    * @dev
    */
    function rewardAvailable() external view returns (bool); // whether the daily reward is available to claim

    /**
    * @dev
    */
    function claimReward() external; // claim daily reward and receive tokens

    /**
    * @dev
    */
    function changeAlias(bytes10 newAlias) external; // change the alias, costs tokens

    /**
    * @dev
    */
    function getAlias() external view returns (string memory userAlias); // get the current user alias

    /**
    * @dev
    */
    function buyTokens() external payable; // buy additional thought tokens with eth, amount determined by value

    /**
    * @dev
    */
    function getTokens() external view returns (uint); // get the token balance of the current user

    /**
    * @dev
    */
    function isModerator() external view returns (bool); // check if the current user is a moderator
}

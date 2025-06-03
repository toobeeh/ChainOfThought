// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

interface IChainOfThoughtEvents {
    // ======================
    // Contract Events

    event PostPublished(bytes32 indexed postHash, address indexed author, uint timestamp);
    event PostAccessed(bytes32 indexed postHash, address indexed reader);
    event PostFavorized(bytes32 indexed postHash, address indexed reader);
    event AliasChanged(address indexed user, bytes20 newAlias);
    event UserBalanceChanged(address indexed user, uint newBalance);
}

struct PostStats {
    uint favorites;
    uint accesses;
    bytes32[] references;
    address author;
    bool hidden;
    bytes32 referencedPostHash;
}

interface IChainOfThought is IChainOfThoughtEvents {

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
    * @dev Get the token cost to add a post to the personal favorite list; should be a multiple of the access price
    */
    function getFavoritePrice() external view returns (uint tokensToFavorite);

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

    /**
    * @dev Set the amount of claimable token rewards
    */
    function setRewardAmount(uint rewardTokenAmount) external;

    /**
    * @dev Get the amount of claimable token rewards
    */
    function getRewardAmount() external view returns (uint rewardTokenAmount);

    // ======================
    // Publishing Posts

    /**
    * @dev Estimate the thought token cost of publishing a new post; does not change the state
    */
    function estimatePostCost(string calldata title, string calldata content, bytes calldata icon, bytes32 psPostHash) external view returns (uint);

    /**
    * @dev Publish a new post; costs tokens
    */
    function publishPost(string calldata title, string calldata content, bytes calldata icon, bytes32 psPostHash) external returns (bytes32 postHash);

    /**
    * @dev Get the hash of a post based on its content
    */
    function getPostHash(
        string calldata title,
        string calldata content,
        bytes calldata icon,
        bytes32 psPostHash,
        address author,
        uint timestamp
    ) external view returns (bytes32 postHash);

    // ======================
    // Listing Access

    /**
    * @dev Get all existing post hashes
    */
    function allPosts() external view returns (bytes32[] memory allPostHashes);

    /**
    * @dev Get post stats
    */
    function getPostStats(bytes32 postHash) external view returns (PostStats memory stats);

    /**
    * @dev Get all favorized posts
    */
    function userFavoritePosts() external view returns (bytes32[] memory favoritePostHashes);

    /**
    * @dev Get all posts of the personal access list
    */
    function userAccessedPosts() external view returns (bytes32[] memory accessedPostHashes);

    /**
    * @dev Get all posts that the user created
    */
    function userWrittenPosts() external view returns (bytes32[] memory ownPostHashes);

    /**
    * @dev Get all posts that the user created
    */
    function getAccessAllowedPostsOfUser(address author) external view returns (bytes32[] memory allowedPostHashes);

    // ======================
    // Viewing Posts

    /**
    * @dev Adds the post to the personal access list; costs tokens
    */
    function addPostToAccessList(bytes32 postHash) external;

    /**
    * @dev Adds the post to the favorites; costs tokens; needs to be in the personal access list
    */
    function addPostToFavorites(bytes32 postHash) external;

    /**
    * @dev for moderators, will hide the post from the listing
    */
    function flagPostAsHidden(bytes32 postHash) external;

    // ======================
    // User Interaction

    /**
    * @dev Check if the user has a daily reward available
    */
    function rewardAvailable() external view returns (bool isAvailable);

    /**
    * @dev Claim the available reward
    */
    function claimReward() external;

    /**
    * @dev Change the alias of the user; costs tokens
    */
    function changeAlias(bytes20 newAlias) external;

    /**
    * @dev Get the current user alias; if not set, returns the address
    */
    function getAlias() external view returns (string memory userAlias);

    /**
    * @dev Get the alias of a specific user; if not set, returns the address
    */
    function getAliasOf(address user) external view returns (string memory userAlias);

    /**
    * @dev Buy additional thought tokens with ETH; amount determined by the current token value
    */
    function buyTokens() external payable;

    /**
    * @dev Get the token balance of the current user
    */
    function getTokenBalance() external view returns (uint);
}

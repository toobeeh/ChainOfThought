// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "./IChainOfThought.sol";
import {AccessControl} from "../dependencies/@openzeppelin-contracts-5.3.0/access/AccessControl.sol";
import {IERC223Recipient} from "./erc223/IERC223Recipient.sol";
import {IThoughtToken} from "./IThoughtToken.sol";
import {Strings} from "../dependencies/@openzeppelin-contracts-5.3.0/utils/Strings.sol";

contract ChainOfThought is IChainOfThought, IERC223Recipient, AccessControl {

    // Constants
    IThoughtToken private _thoughtTokenContract;
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    // Application settings
    uint private _ethPerToken = 0.001 ether;
    uint private _tokensToAccess = 10;
    uint private _tokensToRename = 10000; // pricey to avoid frequent name changes
    uint private _rewardIntervalSeconds = 86400; // 24 hours
    uint private _rewardAmount = 1000; // 1000 tokens per day
    uint private _iconTokenPrice = 1000; // 1000 tokens for a post icon
    uint private _iconByteLength = 32 * 32 * 3; // 32x32 icon, 3 bytes per pixel (hex color code)

    // User state management
    mapping(address => bytes20) private _aliases; // mapping of the user's current aliases
    mapping(bytes20 => address) private _aliasOwners; // reverse mapping of aliases to their owners
    mapping(address => uint) private _lastRewardClaimTimestamps; // unix timestamps of the user's last reward claim

    // Post state management
    bytes32[] private _postHashes; // array of all post hashes
    mapping(bytes32 => PostStats) private _postStats; // mapping of post hashes to (non-static -> not saved in content service) stats
    mapping(address => bytes32[]) private _userPosts; // mapping of user addresses to their own post hashes
    mapping(address => bytes32[]) private _favoritePosts; // mapping of user addresses to their favorite post hashes
    mapping(address => bytes32[]) private _postAccessList; // mapping of post hashes to user addresses for access control

    constructor(address thoughtTokenAddress) {
        _thoughtTokenContract = IThoughtToken(thoughtTokenAddress);

        // Set up roles
        _setRoleAdmin(MODERATOR_ROLE, OWNER_ROLE);
        _setRoleAdmin(OWNER_ROLE, OWNER_ROLE);
        _grantRole(OWNER_ROLE, msg.sender);
    }

    // ======================
    // Management

    function getThoughtTokenContractAddress() external view override returns (address) {
        return address(_thoughtTokenContract);
    }

    function isModerator(address account) external view override returns (bool) {
        return hasRole(MODERATOR_ROLE, account);
    }

    function removeModerator(address account) external override onlyRole(OWNER_ROLE) {
        require(hasRole(MODERATOR_ROLE, account), "Account is not a moderator");
        revokeRole(MODERATOR_ROLE, account);
    }

    function addModerator(address account) external override onlyRole(OWNER_ROLE) {
        require(!hasRole(MODERATOR_ROLE, account), "Account is already a moderator");
        grantRole(MODERATOR_ROLE, account);
    }

    // ======================
    // Contract Settings

    function setTokenValue(uint ethPerToken) external override onlyRole(MODERATOR_ROLE) {
        _ethPerToken = ethPerToken;
    }

    function getTokenValue() public view override returns (uint ethPerToken) {
        return _ethPerToken;
    }

    function setAccessPrice(uint tokensToAccess) external override onlyRole(MODERATOR_ROLE) {
        _tokensToAccess = tokensToAccess;
    }

    function getAccessPrice() public view override returns (uint tokensToAccess) {
        return _tokensToAccess;
    }

    function setRenamePrice(uint tokensToRename) external override onlyRole(MODERATOR_ROLE) {
        _tokensToRename = tokensToRename;
    }

    function getRenamePrice() public view override returns (uint tokensToRename) {
        return _tokensToRename;
    }

    function setRewardInterval(uint intervalToRewards) external override onlyRole(MODERATOR_ROLE) {
        _rewardIntervalSeconds = intervalToRewards;
    }

    function getRewardInterval() public view override returns (uint intervalToRewards) {
        return _rewardIntervalSeconds;
    }

    function setRewardAmount(uint rewardAmount) external override onlyRole(MODERATOR_ROLE) {
        _rewardAmount = rewardAmount;
    }

    function getRewardAmount() public view override returns (uint rewardTokenAmount) {
        return _rewardAmount;
    }

    function getFavoritePrice() public view override returns (uint) {
        return _tokensToAccess * 5;
    }

    // ======================
    // Publishing Posts

    function estimatePostCost(
        string calldata title,
        string calldata content,
        bytes calldata icon,
        bytes32 psPostHash
    ) public view override returns (uint) {
        uint iconCost = icon.length > 0 ? _iconTokenPrice : 0;
        uint contentCost = bytes(content).length;
        uint titleCost = bytes(title).length;
        return titleCost + contentCost + iconCost;
    }

    function getPostHash(
        string calldata title,
        string calldata content,
        bytes calldata icon,
        bytes32 psPostHash,
        address author,
        uint timestamp
    ) public pure override returns (bytes32) {
        return keccak256(abi.encodePacked(title, content, icon, psPostHash, author, timestamp));
    }

    function publishPost(
        string calldata title,
        string calldata content,
        bytes calldata icon,
        bytes32 psPostHash
    ) external override returns (bytes32) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(content).length > 0, "Content cannot be empty");
        require(icon.length == _iconByteLength || icon.length == 0, "Icon size exceeds maximum allowed size");

        uint postCost = estimatePostCost(title, content, icon, psPostHash);
        require(_thoughtTokenContract.balanceOf(msg.sender) >= postCost, "Insufficient tokens to publish post");

        // Transfer tokens for post cost
        require(_thoughtTokenContract.burn(postCost, msg.sender), "Token burn failed");

        // Create post hash
        bytes32 postHash = getPostHash(title, content, icon, psPostHash, msg.sender, block.timestamp);
        require(_postStats[postHash].author == address(0), "Post already exists");

        // add as ps
        if(_postStats[psPostHash].author != address(0)) {

            // require referenced post to be in access list or to be own post
            bytes32[] memory accessedPosts = _postAccessList[msg.sender];
            bool isReferencable = _postStats[psPostHash].author == msg.sender; // allow own post reference
            for (uint i = 0; i < accessedPosts.length && !isReferencable; i++) {
                if (accessedPosts[i] == psPostHash) {
                    isReferencable = true;
                    break;
                }
            }
            require(isReferencable, "Referenced post must be in access list or own post");

            _postStats[psPostHash].references.push(postHash);
        }
        else {
            psPostHash = bytes32(0); // reset if psPostHash does not exist
        }

        // Store post data
        bytes32[] memory references;
        PostStats memory postStats = PostStats(0, 0, references, msg.sender, false, psPostHash);
        _postHashes.push(postHash);
        _postStats[postHash] = postStats;
        _userPosts[msg.sender].push(postHash);

        // Emit events
        emit PostPublished(postHash, msg.sender, block.timestamp);
        emit UserBalanceChanged(msg.sender, _thoughtTokenContract.balanceOf(msg.sender));

        return postHash;
    }

    // =======================
    // Listing Access

    function allPosts() external view override returns (bytes32[] memory) {
        return _postHashes;
    }

    function getPostStats(bytes32 postHash) external view returns (PostStats memory){
        require(_postStats[postHash].author != address(0), "Post does not exist");
        require(!_postStats[postHash].hidden, "Post is hidden");
        return _postStats[postHash];
    }

    function userFavoritePosts() external view override returns (bytes32[] memory) {
        return _favoritePosts[msg.sender];
    }

    function userAccessedPosts() external view override returns (bytes32[] memory) {
        return _postAccessList[msg.sender];
    }

    function userWrittenPosts() external view override returns (bytes32[] memory) {
        return _userPosts[msg.sender];
    }

    function getAccessAllowedPostsOfUser(address author) external view override returns (bytes32[] memory) {
        bytes32[] memory accessedPosts = _postAccessList[author];
        bytes32[] memory writtenPosts = _userPosts[author];
        bytes32[] memory allPosts = new bytes32[](accessedPosts.length + writtenPosts.length);

        uint index = 0;
        for (uint i = 0; i < accessedPosts.length; i++) {
            allPosts[index++] = accessedPosts[i];
        }
        for (uint i = 0; i < writtenPosts.length; i++) {
            allPosts[index++] = writtenPosts[i];
        }
        return allPosts;
    }

    // ======================
    // Viewing Posts

    function addPostToAccessList(bytes32 postHash) external override {
        require(_postStats[postHash].author != address(0), "Post does not exist");
        require(_thoughtTokenContract.balanceOf(msg.sender) >= _tokensToAccess, "Insufficient tokens to access post");
        require(_postStats[postHash].author != msg.sender, "Cannot access your own post");

        // check if already in access list
        bytes32[] memory accessedPosts = _postAccessList[msg.sender];
        for (uint i = 0; i < accessedPosts.length; i++) {
            require(accessedPosts[i] != postHash, "Post already in access list");
        }

        // Transfer tokens for access to post author
        address owner = _postStats[postHash].author;
        require(_thoughtTokenContract.transfer(_tokensToAccess, msg.sender, owner), "Token transfer failed");

        // Add user to post access list
        _postAccessList[msg.sender].push(postHash);
        _postStats[postHash].accesses += 1; // Increment access count

        // Emit events
        emit PostAccessed(postHash, msg.sender);
        emit UserBalanceChanged(msg.sender, _thoughtTokenContract.balanceOf(msg.sender));
        emit UserBalanceChanged(owner, _thoughtTokenContract.balanceOf(owner));
    }

    function addPostToFavorites(bytes32 postHash) external override {
        require(_postStats[postHash].author != address(0), "Post does not exist");
        require(_thoughtTokenContract.balanceOf(msg.sender) >= getFavoritePrice(), "Insufficient tokens to favorite post");

        // check if in access list, also rules out being own post
        bool isInAccessList = false;
        bytes32[] memory accessedPosts = _postAccessList[msg.sender];
        for (uint i = 0; i < accessedPosts.length; i++) {
            if (accessedPosts[i] == postHash) {
                isInAccessList = true;
                break;
            }
        }
        require(isInAccessList, "Post must be in access list to favorite");

        // check if in favorites
        bytes32[] memory favoritePosts = _favoritePosts[msg.sender];
        for (uint i = 0; i < favoritePosts.length; i++) {
            require(favoritePosts[i] != postHash, "Post already favorited");
        }

        // Transfer tokens for favoriting post
        address owner = _postStats[postHash].author;
        require(_thoughtTokenContract.transfer(getFavoritePrice(), msg.sender, owner), "Token transfer failed");

        // Add post to user's favorites
        _favoritePosts[msg.sender].push(postHash);
        _postStats[postHash].favorites += 1; // Increment favorites count

        // Emit events
        emit PostAccessed(postHash, msg.sender);
        emit UserBalanceChanged(msg.sender, _thoughtTokenContract.balanceOf(msg.sender));
        emit UserBalanceChanged(owner, _thoughtTokenContract.balanceOf(owner));
    }

    function flagPostAsHidden(bytes32 postHash) external override onlyRole(MODERATOR_ROLE) {
        require(_postStats[postHash].author != address(0), "Post does not exist");
        _postStats[postHash].hidden = true;
    }

    // ======================
    // User Interaction

    function rewardAvailable() public view override returns (bool) {
        uint lastClaim = _lastRewardClaimTimestamps[msg.sender];
        if (lastClaim == 0) {
            return true; // User has never claimed rewards
        }
        return block.timestamp >= lastClaim + _rewardIntervalSeconds;
    }

    function claimReward() external override {
        require(rewardAvailable(), "Reward not available yet");

        // Update last claim timestamp
        _lastRewardClaimTimestamps[msg.sender] = block.timestamp;

        // Mint reward tokens
        _thoughtTokenContract.mint(_rewardAmount, msg.sender);

        // Emit event with new balance
        uint newBalance = _thoughtTokenContract.balanceOf(msg.sender);
        emit UserBalanceChanged(msg.sender, newBalance);
    }

    function changeAlias(bytes20 newAlias) external override {
        require(newAlias != bytes20(0), "Alias cannot be empty");
        require(_thoughtTokenContract.balanceOf(msg.sender) >= _tokensToRename, "Insufficient tokens to change alias");
        require(_aliasOwners[newAlias] == address(0), "Alias already taken");
        require(_thoughtTokenContract.burn(_tokensToRename, msg.sender), "Token burn failed");

        // Update alias mappings
        bytes20 oldAlias = _aliases[msg.sender];
        if (oldAlias != bytes20(0)) {
            delete _aliasOwners[oldAlias]; // Remove old alias owner
        }
        _aliases[msg.sender] = newAlias; // Set new alias
        _aliasOwners[newAlias] = msg.sender; // Set new alias owner

        emit AliasChanged(msg.sender, newAlias);
        emit UserBalanceChanged(msg.sender, _thoughtTokenContract.balanceOf(msg.sender));
    }

    function getAliasOf(address user) public view override returns (string memory) {
        bytes20 _alias = _aliases[user];
        if (_alias == bytes20(0)) {
            return Strings.toHexString(user); // Return address as string if alias not set
        }
        return string(abi.encodePacked(_alias)); // Return the alias as string
    }

    function getAlias() public view override returns (string memory) {
        return getAliasOf(msg.sender);
    }

    function buyTokens() external payable override {
        require(msg.value > 0, "Must send ETH to buy tokens");
        require(msg.value % _ethPerToken == 0, "ETH sent must be a multiple of token price");
        uint tokensToMint = msg.value / _ethPerToken;

        // Mint tokens to the sender
        _thoughtTokenContract.mint(tokensToMint, msg.sender);

        // Emit event with new balance
        uint newBalance = _thoughtTokenContract.balanceOf(msg.sender);
        emit UserBalanceChanged(msg.sender, newBalance);
    }

    function getTokenBalance() external view override returns (uint) {
        return _thoughtTokenContract.balanceOf(msg.sender);
    }

    // ======================
    // IERC223Recipient implementation

    function tokenReceived(
        address from,
        uint256 value,
        bytes memory data
    ) public override { }
}

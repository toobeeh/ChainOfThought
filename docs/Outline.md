Chain Of Thought
===

## Short description of functionality:
A blog-like application where users can publish posts.  
Target audience is rather creative writing than social media.  
A post can only have text. Each character is worth a "thought token".  
When submitting a post, authors can opt to upload a custom 48x48 icon which will be visible in the post listing and as decoration on the post view. Submitting an icon costs extra tokens.  
Users get an amount of tokens daily. Reading posts of other users costs (once to unlock) tokens.  
To write a post, you pay tokens that you either received by login, or by other users reading your posts.  
Users can add a post to their favorites, which will cost additional tokens which the author receives.  
Moderators can remove inappropriate posts.  
Users can not modify their posts once submitted, but may extend them, which also moves the post up in the timeline.  
Users can change their alias by paying tokens.

## Off-chain part / frontend:
A listing of all posts (title / author) and if present, the post icon.  
Clicking a post will open a view containing post title, author and content.  
On the landing page, users will see a notification when they can claim their daily tokens.  
Moderators can remove a post on the post view.
On the landing page, users have the option to enter a view to create a post.  
The create view features a title field, content field, and upload field for an icon.  
The landing page also offers to change the alias, which redirects to a own view as well.  
The alias view shows the current alias, and a text box for the new alias.  
Users may buy additional thought tokens for ether.

### Sitemap:
```
landing (page)
├──posts (page -> views all posts ordered by date)
│   ├──filter (interaction -> set post filter to contain only favorites/own posts)  
│   ├──view (page -> views a specific post + interaction -> transaction to load post)  
│   │   ├──delete (interaction -> only for moderators)
│   │   └──back (interaction -> back to posts)
│   └──back (interaction -> back to landing)
│ 
├──write (page -> publish a new post)
│   ├──submit (interaction -> transaction to publish post)      
│   └──back (interaction -> back to landing)
│ 
├──rename (page -> change your alias)
│   ├──submit (interaction -> transaction to rename own alias)      
│   └──back (interaction -> back to landing)
│ 
├──buy (page -> buy more tokens)
│   ├──submit (interaction -> transaction to buy tokens)      
│   └──back (interaction -> back to landing)
│
└──claim (interaction -> transaction to receive daily thought tokens)
```


## On-chain part / contracts:
- A contract containing the thought token
- A contract managing the application (the published posts, author aliases and login rewards, ..)

The application contract needs to expose following interface.
The interface does not account for access control.

```solidity
// events
PostPublished(uint indexed postId, address indexed author);
PostAccessed(uint indexed postId, address indexed reader);
AliasChanged(address indexed user, bytes10 newAlias);
TokensPurchased(address indexed user, uint amount);

// token contract for balance checks & events
function getThouthTokenContractAddress() external view returns (address);

// role management for owner, not part of the UI
function isModerator(address account) external view returns (bool);
function removeModerator(address account) external;
function addModerator(address account) external;

// utility, setters only for moderator
function setTokenValue(uint value) external; // set the eth value of one thought token
function getTokenValue() external view returns (uint); // get the current eth value of a thought token
function setAccessPrice(uint value) external; // set the price to add a post to the access list
function getAccessPrice external view returns (uint); // get the price to add a post to the access list
function setRenamePrice(uint value) external; // set the price to change alias
function getRenamePrice external view returns (uint value); // get the price to change alias
function setRewardInterval(uint seconds) external; // set the interval where rewards are claimable
function getRewardInterval external view returns (uint); // get the interval where rewards are claimable

// posting
function publish(string calldata title, string calldata content, bytes calldata icon, uint psId) external; // publish a new post, costs tokens
function estimateCost(string calldata title, string calldata content, bytes calldata icon, uint psId) external view returns (uint); // estimates the token cost for a new posting

// listing
function posts() external view returns (PostListing[]); // get all post listing (title, author, icon, date)
function favorites() external view returns (uint[] memory); // get all favorized posts
function accessed() external view returns (uint[] memory); // get all posts of the personal access list

// post view
function viewPost(uint postId) external view returns (Post); // gets post content; must be in personal access list
function addPostToAccessList(uint postId) external; // adds the post to the personal access list; costs tokens
function addPostToFavorites(uint postId) external; // adds the post to the favorites; costs tokens
function flagPostAsDeleted(uint postId) external; // for moderators, will hide the post from the listing

// user
function rewardAvailable() external view returns (bool) // whether the daily reward is available to claim
function claimReward() external; // claim daily reward and receive tokens
function changeAlias(bytes10 calldata newAlias) external; // change the alias, costs tokens
function getAlias() external view returns (string); // get the current user alias
function buyTokens() external payable; // buy additional thought tokens with eth, amount determined by value
function getTokens() external view returns (uint); // get the token balance of the current user
function isModerator() external view returns (bool); // check if the current user is a moderator

```

## Token concept / standards:
The thought token should implement the IERC223 standard to provide a safe way to interact with it.  
Tokens are minted by the application contract either by login or buying additional tokens.

## Ether usage:
The application is generally free to use.  
Users can get more tokens by buying them with ether.

## Roles:
A single contract-deploying user shall receive an owner role.  
There is a moderator role which can be assigned by the owner (not managed by the UI).
All other users do not need a role and are treated as author.

## Data structures:
There are several data strucures necessary to save the state.
- A struct represents a post, containing
    - Author address
    - Title
    - Content
    - Optional image
    - Flag if it is marked as removed (for simplicity and gas cost efficiency)
    - Creation timestamp
    - Post Scriptum (of) ID (to append to a previous post)

- A mapping of post ID -> post struct, to store all posts
- An array of post IDs, to iterate the mapping
- A mapping of address -> timestamp, to keep track of the last login reward claims
- A mapping of address -> post id array, to keep track of favorite posts
- A mapping of address -> bytes10, to store user aliases
- A mapping of address -> post id array, to keep track of user accessed posts

Besides that, there are data structures for role management, implemented in the openzeppelin library, and the token contract.

## Security considerations:
Besides token transfers between users, there are no concepts involving potential security issues.  
Given the fact that the contract storage can be read, this opens the possibility for post piracy, circumventing owner revenue through viewing a post.

## Used coding patterns in addition to roles (randomness, commitments, timeouts, deposits or other):

Timeouts are used for login reward claims.  
Users deposit ether to buy tokens.  
The owner shall be able to withdraw the deposited ether.  
Storing and accessing the relationship between poster, posting, favorizing a post, following-up on a post are a big aspect to maintain gas and storage efficiency.
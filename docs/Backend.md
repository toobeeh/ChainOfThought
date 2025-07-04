Content Service
====

This application consists of a off-chain part, the content service (thought cloud).  
Posts are stored partially on-chain and partially off-chain, because content and icon data can be large.  
This document discusses some design considerations for the content service

### Authentication
Users need to authenticate with the REST API using a bearer token so that the content service can perform checks for an authenticated address.  
The API uses a bearer token for authentication, consists of the Base64 of a signed nonce, proving the ownership of the user's address:
```json
{
  "message": "nonce-presented-at-login",
  "signature": "0x..."
}
```

This can be obtained by the client by signing the nonce through metamask.  
The token is provided as Bearer token in the request header, which the server uses to obtain and verify the sender's address.

### Reading Posts
Posts need to be present in the user's access list in order to be readable.  
Whenever the user requests a post content, the server will check using public functions fo the Chain of Thought contract if the user has access to the post.  
The API exposes reduced Preview DTOs, which can always be accessed, even if not in the access list.

## Data Separation

Following data is stored on-chain:
- Post hash
- Author address
- Favorite count
- Referenced post hash (PS)
- Referencing post hashes (PS of other posts)
- Hidden flag
This data is needed for computations in the contract. 

Off chain, the remaining data is stored:
- Title
- Content
- Author address
- Icon
- Ps hash
- Timestamp

## Writing Posts

### Ensuring authenticity
With the separated storage, a flow is needed to ensure that the content service post is exactly wht intended on-chain:
- Post data must match with the data that the author paid for
- Post data must not be uploadable in the name of another author
- Post data must only be uplaodable if paid for
- To posting process must not be visible to anyone else besides the author

The initial concept was to sign a post transaction, which the content service would receive and execute.  
This ensures that it has access to the signed and therefore valid parameters.  
Metamask does not support signing transaction without sending, so this was not an option.  

Another try was to publish events from the contract after post publishing, which the content service can be sure of authenticity.   
This has the downside that the events may be recorded and post contents can be accessed without paying for.  

### Current flow
The current flow is as follows:
- The user publishes the post on the blockchain, which persists the data mentioned above. 
- The contract broadcasts an event with the post hash and author address.
- The user listens for events until a "Post Published" event is received that matches the previous transaction ID of the published post (to make sure it is the right interaction)
- The user sends exactly the same post data to the content service, including the timestamp received by the event
- The content service verifies the post data and uploads it if it matches:
    - The calculated (by the provided request data) post hash must exist on-chain for the author
    - The author address of the provided data (which is relevant for the post hash) must match the address of the authenticated user

Through the recalculated hash, this ensures authenticity and integrity of the uploaded data:
- the user cannot fake another author in the request data, because this would result in a different hash
- the user cannot upload for another author, because the author has to authenticate with a signed token, which signing address can be matched
- the user cannot tamper with the original post content which he paid for, because this would result in a different hash
Chain Of Thought
====

Parts of the application:
- Thought Token Contract
- Chain of Thought Contract
- Thought Cloud Server
- Chain of Thought Frontend

The thought content server is used to offload the storage of the published posts from the blockchain.  
The server needs to verify that the calling user really has the rights to access or publish a post.

## Thought Cloud
The thought cloud is a server which stores the post content and metadata.  
It exposes a REST API to the frontend.  

### Authentication
Users need to authenticate with the REST API using a bearer token.  
The bearer token consists of the Base64 of a signed nonce, proving the ownership of the user's address:
```json
{
  "address": "0x1234...",
  "message": "nonce",
  "signature": "0x..."
}
```

This can be obtained by the client by signing the nonce through metamask.  
The token will be provided as Bearer token in the request header, which the server then can use to obtain and verify the sender's address. 
This avoids the need to repeatedly sign transactions for posts that the user already has access to.

### Reading Posts
Posts need to be present in the user's access list in order to be readable.  
Whenever the user requests a post content, the server will check using public functions fo the Chain of Thought contract if the user has access to the post.  
Users access posts by their hash.

### Publishing Posts
The contract does not store post content and metadata, but only its hash.
To publish a post, the user needs to sign a transaction to the publish method of the contract, which will then be forwarded to the server.  
The server decodes post content and metadata, adds it to the database, tries to execute the signed transaction and if that fails, it removes the post again.

## Chain Of Thought

Generate the abi:
`forge inspect src/ChainOfThought.sol abi --json > ./abi/ChainOfThought.json`

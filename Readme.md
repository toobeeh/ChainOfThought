Chain Of Thought
====
Chain of Thought is a decentralized application with a blog-like structure, written in solidity for the ethereum blockchain.  
Users can share posts, reply to posts, and favorite posts.  

Additionally, interacting with posts (writing, reading, ..) costs "thought tokens", which can be received for free on a daily basis, or purchased with ether.  
The application features a simplistic typewriter-styled interface and targets a creative audience instead of imitating a social media blog.

## Architecture

A main consideration in the architecture is to offload the storage of the published posts from the blockchain.
This results in four components:

Parts of the application:
- Thought Token contract (blockchain)
- Chain of Thought contract (blockchain)
- Thought Cloud server (NestJS REST API)
- Chain of Thought Frontend (Angular frontend)

The blockchain and backend parts can generate interfaces (abi, openapi specs) which are used in other parts to scaffold type-safe code.  
The repository provides a docker compose file to provide an easy way to test the application.

### Thought Token Contract
This contract is deployed on the blockchain and follows an ERC223 standard to implement ThoughtTokens, which are used by the application as currency.

### Chain Of Thought Contract
This contract is deployed on the blockchain and consists of all the business logic of the application.  
It stores only metadata of the posts which are used for computation. 

### Thought Cloud
The thought content server NestJs REST API with a SQLite database to store post contents.  
The server implements authentication for reading and additionally authorization for uploading post data.

### Chain Of Thought Frontend
The application frontend is an angular application which accesses the blockchain through a browser provider like Metamask, and accesses post contents through the REST API of the Thought Cloud server.



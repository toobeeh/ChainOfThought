Offchain Version
====

Because this project comes from my heart & blockchain is not easily accessible & cumbersome for demo purposes, 
there is an offchain version available which mocks the blockchain fuctionality via REST.  
This version is fully functional, but not best-practice REST and introduces overhead because it functions as a drop-in
for the blockchain versio nwith as few adaptions as possible.

## Backend
The backend has an offchain and blockchain module.  
Based on the env variable `THOUGHTCLOUD_BACKEND` it starts with different services that either access the blockchain, or the sqlite database.  
The offchain module also implements controllers for al funcctions that the frontend usually would access via blockchain state or transaction (which is the main part of features).

## Frontend
The frontend can be built with an environment value which enables the offchain version.  
Depending on this value, different services are used in DI.  
To simulate a similar login functionality, a key pair is generated that is served to sign a token.  
The only feature that can't be used is buying tokens.
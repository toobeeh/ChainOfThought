Development 
===
Dev setup & commands can be found here.  
> Warning: Generated files (like frontend and backend clients) are not committed and must be generated before running the application.

## Docker
For simplicity, all services can be started using the provided docker compose file in `./docker/docker-compose.yml`.  
The docker compose file will build images for frontend, backend and a anvil instance with the contract deployed.  
The docker compose is configured to start a ready-to-use, fresh application with default anvil accounts and balances.  
The frontend is accessible on `http://localhost:80`, the API is exposed on `http://localhost:3000/api` and features a swagger interface on `http://localhost:3000/docs`, and the anvil instance is available on `http://localhost:8545`.

To test the application frontend with metamask, the anvil network has to be added as custom network in metamask.  
The, the default anvil accounts can be imported by their private keys.

## Blockchain
For development, foundry is used to run the blockchain. 
Following commands are relevant:
```bash
# Install dependencies
forge soldeer install

# Generate abi for the main contract
forge inspect src/ChainOfThought.sol abi --json > ./abi/ChainOfThought.json

# Run the local blockchain
anvil

# Run tests
forge test -vvv

# Deploy on the local blockchain
forge script script/Deploy.s.sol:Dev --broadcast -vvv
```

## Backend
The content service (ThoughtCloud) is a NestJS REST API.  
Following commands are relevant:
```bash
# Install dependencies
npm install

# Generate abi client types
npm run generate:abi

# Generate openapi specs for the current backend
npm run generate:openapi

# Start the server
npm run start:dev
```

## Frontend
The frontend is an Angular app.  
Following commands are relevant:
```bash
# Install dependencies
npm install

# Generate abi client
npm run generate:abi

# Generate backend service client - make sure to generate the openapi specs first in backend
npm run generate:api

# Start the server
npm run start
```

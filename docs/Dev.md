Development 
===
Dev setup & commands can be found here.  
> Warning: Generated files (like frontend and backend clients) are not committed and must be generated before running the application.

## Docker
For simplicity, all services can be started using the provided docker compose file in `./docker/docker-compose.yml`.

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

# Generate backend service client
npm run generate:api

# Start the server
npm run start
```

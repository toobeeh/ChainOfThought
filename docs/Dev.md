Development 
===
Dev setup & commands can be found here.

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

# Start the server
npm run start:dev

# Generate abi client types
npm run generate:abi
```

## Frontend
The frontend is an Angular app.  
Following commands are relevant:
```bash
# Install dependencies
npm install

# Start the server
npm run start

# Generate abi client types
npm run generate:abi
```

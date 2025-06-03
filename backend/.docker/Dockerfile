FROM ghcr.io/foundry-rs/foundry AS abi-build

USER root
WORKDIR /app/blockchain

COPY blockchain .

RUN forge soldeer install

RUN forge inspect src/ChainOfThought.sol abi --json > ChainOfThought.json

FROM node:20-alpine AS api-build

WORKDIR /app
COPY --from=abi-build /app/blockchain/ChainOfThought.json ./blockchain/abi/ChainOfThought.json

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./

RUN npm ci

COPY backend/ ./

RUN npm run generate:abi
RUN npm run build

FROM node:20-alpine
ARG CHAIN_URL
ARG CHAIN_CONTRACT_ADDRESS

WORKDIR /app/backend

# Copy only necessary files from build stage
COPY --from=api-build /app/backend/package.json ./
COPY --from=api-build /app/backend/node_modules ./node_modules
COPY --from=api-build /app/backend/dist ./dist

# Expose the port your NestJS app listens on (default 3000)
EXPOSE 3000

WORKDIR /app/backend/dist/src

## echo args to env
ENV CHAIN_URL=${CHAIN_URL}
ENV CHAIN_CONTRACT_ADDRESS=${CHAIN_CONTRACT_ADDRESS}

# Start the app in production mode
CMD ["node", "main.js"]

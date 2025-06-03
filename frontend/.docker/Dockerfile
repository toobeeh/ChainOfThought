FROM ghcr.io/foundry-rs/foundry AS abi-build

USER root
WORKDIR /app/blockchain

COPY blockchain .

RUN forge soldeer install

RUN forge inspect src/ChainOfThought.sol abi --json > ChainOfThought.json

FROM node:18 AS api-build

WORKDIR /app
COPY --from=abi-build /app/blockchain/ChainOfThought.json ./blockchain/abi/ChainOfThought.json

WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./

RUN npm ci

COPY backend/ ./

RUN npm run generate:abi
RUN mkdir dist
RUN npm run generate:openapi

FROM node:18 AS build
ARG CONTENT_API_URL
ARG CHAIN_CONTRACT_ADDRESS

# for openapi generator.. :/
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jre-headless && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=abi-build /app/blockchain/ChainOfThought.json ./blockchain/abi/ChainOfThought.json
COPY --from=api-build /app/backend/dist/openapi.json ./backend/dist/openapi.json

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci

COPY frontend .

RUN sed -i "s|%%CONTENT_API_URL%%|${CONTENT_API_URL}|g" src/environments/environment.ts
RUN sed -i "s|%%CHAIN_CONTRACT_ADDRESS%%|${CHAIN_CONTRACT_ADDRESS}|g" src/environments/environment.ts

RUN npm run
RUN npm run generate:abi
RUN npm run generate:api
RUN npm run build

FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html

COPY frontend/.docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
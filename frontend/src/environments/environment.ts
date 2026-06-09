import {cotEnvironment} from "./environment.interface";

export const environment: cotEnvironment = {
    contractAddress: "%%CHAIN_CONTRACT_ADDRESS%%",
    contentApiUrl: "%%CONTENT_API_URL%%",
    enableOffchainBackend: "%%ENABLE_OFFCHAIN_BACKEND%%" as string === "true"
};

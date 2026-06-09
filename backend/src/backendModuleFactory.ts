import {BlockchainModule} from "./modules/blockchain/blockchain.module";
import * as process from "process";
import {OffchainModule} from "./modules/offchain/offchain.module";

export function getBackendModule(){
    console.log(`Using backend module: ${process.env.THOUGHTCLOUD_BACKEND ?? 'offchain'}`);
    return process.env.THOUGHTCLOUD_BACKEND === 'blockchain' ? BlockchainModule : OffchainModule;
}
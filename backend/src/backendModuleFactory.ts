import {BlockchainModule} from "./modules/blockchain/blockchain.module";
import * as process from "process";
import {OffchainModule} from "./modules/offchain/offchain.module";

export function getBackendModule(){
    return process.env.THOUGHTCLOUD_BACKEND === 'blockchain' ? BlockchainModule : OffchainModule;
}
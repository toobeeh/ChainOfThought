import {Injectable} from '@nestjs/common';
import {ChainOfThought, ChainOfThought__factory} from "../../types/ethers-contracts";
import {JsonRpcProvider} from "ethers";
import {config} from "../config";


@Injectable()
export class ChainOfThoughtService {

    private _contract: ChainOfThought | undefined;

    public async getContract(): Promise<ChainOfThought> {
        if (!this._contract) {
            const provider = new JsonRpcProvider(config.networkAddress);
            const signer = await provider.getSigner();
            this._contract = ChainOfThought__factory.connect(config.contractAddress, signer);
        }
        return this._contract;
    }
}
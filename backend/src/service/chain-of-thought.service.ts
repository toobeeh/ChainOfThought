import {Injectable} from '@nestjs/common';
import {ChainOfThought, ChainOfThought__factory} from "../../types/ethers-contracts";
import {JsonRpcProvider} from "ethers";

const contractAddress = process.env.CONTRACT || '0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB';
const networkAddress = process.env.NETWORK || 'http://localhost:8545';

@Injectable()
export class ChainOfThoughtService {

    private _contract: ChainOfThought | undefined;

    public async getContract(): Promise<ChainOfThought> {
        if (!this._contract) {
            const provider = new JsonRpcProvider(networkAddress);
            const signer = await provider.getSigner();
            this._contract = ChainOfThought__factory.connect(contractAddress, signer);
        }
        return this._contract;
    }
}
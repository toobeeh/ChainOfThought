import {Injectable, Scope} from '@nestjs/common';
import {ChainOfThought, ChainOfThought__factory} from "../../types/ethers-contracts";
import {JsonRpcProvider} from "ethers";

const contractAddress = process.env.CONTRACT || '0x0B306BF915C4d645ff596e518fAf3F9669b97016';
const networkAddress = process.env.NETWORK || 'http://localhost:8545';

@Injectable({scope: Scope.REQUEST})
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
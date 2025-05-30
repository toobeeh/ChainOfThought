import {Inject, Injectable} from '@angular/core';
import {ChainOfThought, ChainOfThought__factory} from "../../../types/ethers-contracts";
import {Web3Service} from "./web3.service";
import {environment} from "../../environments/environment";
import {TypedContractEvent, TypedListener} from "../../../types/ethers-contracts/common";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChainOfThoughtService {

  private _contract: ChainOfThought | undefined;

  constructor(
      @Inject(Web3Service) private web3Service: Web3Service
  ) { }

  /**
   * gets or creates the Chain of Thought contract instance.
   * Throws if not instanced & web3 service has not authenticated
   * @private
   */
  public async getContract(): Promise<ChainOfThought> {
    if (!this._contract) {
      this._contract = ChainOfThought__factory.connect(environment.contractAddress, await this.web3Service.getRequiredSigner());
    }
    return this._contract;
  }

  public async getEvents<T extends TypedContractEvent>(contract: ChainOfThought, event: T, listener: TypedListener<T>){
    await contract.on(event, listener);
    return () => {
      contract.off(event, listener);
    }
  }
}

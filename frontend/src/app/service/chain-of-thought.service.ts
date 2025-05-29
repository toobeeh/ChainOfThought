import {Inject, Injectable} from '@angular/core';
import {ChainOfThought, ChainOfThought__factory} from "../../../types/ethers-contracts";
import {Web3Service} from "./web3.service";
import {environment} from "../../environments/environment";

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
  public get contract(): ChainOfThought {
    if (!this._contract) {
      this._contract = ChainOfThought__factory.connect(environment.contractAddress, this.web3Service.getRequiredSigner());
    }
    return this._contract;
  }
}

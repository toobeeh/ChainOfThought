import { Injectable } from '@angular/core';
import {BrowserProvider, JsonRpcSigner} from "ethers";

interface web3State {
  provider: BrowserProvider,
  signer: JsonRpcSigner,
  signedToken: string
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private _state: web3State | undefined;

  constructor() { }

  private async getState(): Promise<web3State> {
    if (this._state === undefined) {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const signedToken = await signer.signMessage("This message will be signed to authenticate you. (Nonce: " + Date.now() + ")");
      this._state = {provider, signer, signedToken};
    }
    return this._state;
  }

  public getRequiredToken() {
    if(this._state === undefined) {
      throw new Error("Web3Service not initialized");
    }

    return this._state.signedToken;
  }

  public async authenticate() {
    await this.getState();
  }

  public get isAuthenticated(): boolean {
    return this._state !== undefined;
  }
}

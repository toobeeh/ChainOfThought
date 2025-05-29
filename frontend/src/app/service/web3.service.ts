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

  private async signState(): Promise<web3State> {
    if (this._state === undefined) {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const signedToken = await signer.signMessage("This message will be signed to authenticate you. (Nonce: " + Date.now() + ")");
      this._state = {provider, signer, signedToken};
      sessionStorage.setItem("web3auth", signedToken);
    }
    return this._state;
  }

  private async readExistingState(): Promise<web3State | undefined> {
    const existingToken = sessionStorage.getItem("web3auth");
    if (existingToken && existingToken.length > 0) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        return {provider, signer, signedToken: existingToken};
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  }

  private async getState(): Promise<web3State | undefined> {
    if (this._state === undefined) {
      this._state = await this.readExistingState();
    }
    return this._state;
  }

  public async getRequiredToken() {
    const state = await this.getState();
    if(state === undefined) {
      throw new Error("Web3Service not initialized");
    }

    return state.signedToken;
  }

  public async getRequiredSigner(): Promise<JsonRpcSigner> {
    const state = await this.getState();
    if (state === undefined) {
      throw new Error("Web3Service not initialized");
    }
    return state.signer;
  }

  public async authenticate() {
    await this.signState();
  }

  public async isAuthenticated(): Promise<boolean> {
    const state = await this.getState();
    return state !== undefined;
  }
}

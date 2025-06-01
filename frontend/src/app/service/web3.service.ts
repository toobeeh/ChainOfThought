import { Injectable } from '@angular/core';
import {BrowserProvider, JsonRpcSigner} from "ethers";

interface web3State {
  provider: BrowserProvider,
  signer: JsonRpcSigner,
  authToken: string
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  private _state: web3State | undefined;

  constructor() { }

  private generateToken(signed: string, message: string): string {
    const tokenPayload = {
      message: message,
      signature: signed
    };
    return btoa(JSON.stringify(tokenPayload));
  }

  public static getCurrentToken(): string | undefined {
    const existingAuth = sessionStorage.getItem("web3auth");
    if (existingAuth && existingAuth.length > 0) {
      const [, token] = existingAuth.split(":");
      return token;
    }
    return undefined;
  }

  private async signState(): Promise<web3State> {
    if (this._state === undefined) {
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const message = "This message will be signed to authenticate you. (Nonce: " + Date.now() + ")";
      const signedToken = await signer.signMessage(message);
      const authToken = this.generateToken(signedToken, message);
      this._state = {provider, signer, authToken};
      sessionStorage.setItem("web3auth", `${await signer.getAddress()}:${authToken}`);
    }
    return this._state;
  }

  private async readExistingState(): Promise<web3State | undefined> {
    const existingAuth = sessionStorage.getItem("web3auth");
    if (existingAuth && existingAuth.length > 0) {
      const [addr, token] = existingAuth.split(":");
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner(addr);
        return {provider, signer, authToken: token};
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

    return state.authToken;
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

  public reset() {
    this._state = undefined;
    sessionStorage.removeItem("web3auth");
  }
}

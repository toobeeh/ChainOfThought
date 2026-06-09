import {Injectable} from "@angular/core";
import {IAuthService} from "../auth.service.interface";
import nacl, {SignKeyPair} from "tweetnacl";
import { encodeBase64, decodeBase64 } from "tweetnacl-util";

@Injectable({
    providedIn: 'root'
})
export class OffchainCryptoService implements IAuthService {

    private _keyPair: SignKeyPair | undefined;
    private _identifier: string | undefined;

    /**
     * base64-encoded JSON string containing a message, signature, and public key.
     * server can verify signature using public key.
     * public key serves as identifier for user (address equivalent)
     */
    getCurrentToken(): string | undefined {
        return sessionStorage.getItem("offchainAuth") ?? undefined;
    }

    /**
     * equivalent to signing a message using an existing wallet.
     * here, a keypair is used to simulate wallet functionality.
     * user can input an existing private key or generate a new one.
     */
    async authenticate(): Promise<void> {

        /* ensure identity exists */
        if(this._keyPair === undefined) {
            let privateKey = localStorage.getItem("offchainPrivateKey");
            if (!privateKey)  {

                // let user input saved private key
                privateKey = prompt("Please enter your private key (base64 encoded) or leave blank to generate a new identity");
                if(privateKey === "") privateKey = null;

                if(privateKey !== null) {
                    try {
                        const test = nacl.sign.keyPair.fromSecretKey(decodeBase64(privateKey));
                    }
                    catch {
                        alert("Invalid private key provided. A new identity will be generated.");
                        privateKey = null;
                    }
                }

                if(privateKey === null) {

                    // generate new keypair
                    const keyPair = nacl.sign.keyPair();

                    // store secret key
                    privateKey = encodeBase64(keyPair.secretKey);

                    // download private key as file
                    const blob = new Blob([privateKey], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "chain-of-thought_identity.txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    alert("A new identity has been generated and downloaded as a file. Use the content to log in next time.");
                }

                localStorage.setItem("offchainPrivateKey", privateKey);
            }

            // derive keypair (recomputes public key)
            this._keyPair = nacl.sign.keyPair.fromSecretKey(decodeBase64(privateKey));
        }

        /* create token */
        const now = Date.now().toString()
        const msg = new TextEncoder().encode(now);
        const signature =  this.toHex(nacl.sign.detached(msg, this._keyPair.secretKey));
        const publicKey = this.toHex(this._keyPair.publicKey);
        const payload = {
            message: now,
            signature,
            publicKey
        };
        const token = btoa(JSON.stringify(payload));
        sessionStorage.setItem("offchainAuth", token);
        this._identifier = publicKey;
    }

    /**
     * checks if user is authenticated by verifying presence of token and identifier.
     */
    async isAuthenticated(): Promise<boolean> {

        // if there's a token but no identifier, try to authenticate (e.g. after page reload)
        if(this.getCurrentToken() !== undefined) await this.authenticate();

        return this._identifier !== undefined && this.getCurrentToken() !== undefined;
    }

    reset(): void {
        sessionStorage.removeItem("offchainAuth");
        localStorage.removeItem("offchainPrivateKey");
        this._keyPair = undefined;
        this._identifier = undefined;
    }

    /**
     * returns the public key as a hex string, which serves as the user's address/identifier in this offchain implementation.
     */
    getAddress(): Promise<string | undefined> {
        return Promise.resolve(this._identifier);
    }

    private toHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }
}
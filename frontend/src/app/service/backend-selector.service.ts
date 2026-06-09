import {inject, Injectable, Type} from "@angular/core";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class BackendSelectorService {

    constructor() { }

    public selectOffchain() {
        localStorage.setItem("backend", "offchain");
        window.location.href = window.location.origin;
        window.location.reload();
    }

    public selectOnchain() {
        localStorage.setItem("backend", "onchain");
        window.location.href = window.location.origin;
        window.location.reload();
    }

    public buildBackend<TOnchain, TOffchain>(onchainService: Type<TOnchain>, offchainService: Type<TOffchain>): TOnchain | TOffchain {
        if(this.selectedBackend === "onchain") {
            return inject(onchainService);
        }
        return inject(offchainService);
    }

    public get selectedBackend(): "onchain" | "offchain" {
        const backend = localStorage.getItem("backend");
        if(backend === "onchain" || backend === "offchain") {
            return backend;
        }
        return environment.enableOffchainBackend ? "offchain" : "onchain";
    }
}
import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import {getAuthenticatedAddress} from "../util/getAuthenticatedAddress";

@Injectable({scope: Scope.REQUEST})
export class AuthService {

    private _authenticatedAddress: string | undefined;

    public attachIdentity(request: any): boolean {
        const address = getAuthenticatedAddress(request);
        this._authenticatedAddress = address;
        return address !== undefined;
    }

    public get authenticatedAddress(): string {
        if (this._authenticatedAddress === undefined) {
            throw new ForbiddenException("No authenticated address recognized.");
        }
        return this._authenticatedAddress;
    }

}
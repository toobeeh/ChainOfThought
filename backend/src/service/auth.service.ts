import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import {getAuthenticatedAddress} from "../util/getAuthenticatedAddress";

@Injectable({scope: Scope.REQUEST})
export class AuthService {

    private authenticatedAddress: string | undefined;

    public attachIdentity(request: any): boolean {
        const address = getAuthenticatedAddress(request);
        this.authenticatedAddress = address;
        return address !== undefined;
    }

    public get authenticatedAddress(): string {
        if (this.authenticatedAddress === undefined) {
            throw new ForbiddenException("No authenticated address recognized.");
        }
        return this.authenticatedAddress;
    }

}
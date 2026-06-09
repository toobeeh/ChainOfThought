import {ForbiddenException, Injectable, Scope} from '@nestjs/common';
import {getAuthenticatedAddress} from "../../util/getAuthenticatedAddress";
import {IAuthService} from "../../service/auth.service.interface";

@Injectable({scope: Scope.REQUEST})
export class BlockchainAuthService implements IAuthService {

    private _authenticatedAddress: string | undefined;

    attachIdentity(request: any): boolean {
        const address = getAuthenticatedAddress(request);
        this._authenticatedAddress = address;
        return address !== undefined;
    }

    get authenticatedAddress(): string {
        if (this._authenticatedAddress === undefined) {
            throw new ForbiddenException("No authenticated address recognized.");
        }
        return this._authenticatedAddress;
    }

}
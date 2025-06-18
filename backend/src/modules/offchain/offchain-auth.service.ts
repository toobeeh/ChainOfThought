import {ForbiddenException, Inject, Injectable, Scope} from "@nestjs/common";
import {IAuthService} from "../../service/auth.service.interface";
import {PostDto} from "../../dto/post.dto";
import {getAuthenticatedAddress} from "../../util/getAuthenticatedAddress";

@Injectable({scope: Scope.REQUEST})
export class OffchainAuthService implements IAuthService {

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
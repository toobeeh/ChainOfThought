import {ForbiddenException, Inject, Injectable, Scope} from "@nestjs/common";
import {IAuthService} from "../../service/auth.service.interface";
import {PostDto} from "../content/dto/post.dto";
import {getAuthenticatedAddress} from "../../util/getAuthenticatedAddress";
import {getAuthenticatedId} from "../../util/getAuthenticatedId";

@Injectable({scope: Scope.REQUEST})
export class OffchainAuthService implements IAuthService {

    private _authenticatedAddress: string | undefined;

    attachIdentity(request: any): boolean {
        const address = getAuthenticatedId(request);
        this._authenticatedAddress = address;
        return address !== undefined;
    }

    get authenticatedAddress(): string {
        if (this._authenticatedAddress === undefined) {
            throw new ForbiddenException("No authenticated id recognized.");
        }
        return this._authenticatedAddress;
    }

}
import {Inject, Injectable, PreconditionFailedException, Scope} from "@nestjs/common";
import {IAccessService} from "../../service/access.service.interface";
import {IAuthService} from "../../service/auth.service.interface";
import {PostDto} from "../../dto/post.dto";

@Injectable({scope: Scope.REQUEST})
export class OffchainPostAccessService implements IAccessService {

    constructor(
        @Inject(IAuthService) private readonly authService: IAuthService,

    ) { }

    async hasAccessTo(postHashes: string[]) {
        return false;
    }

    allowedToUpload(post: PostDto) {
        const address = this.authService.authenticatedAddress;
        return post.authorAddress === address;
    }

    async getIntegrousPostHash(post: PostDto): Promise<string> {
        return "";
    }
}
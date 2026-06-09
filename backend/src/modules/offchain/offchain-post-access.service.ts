import {Inject, Injectable, Scope} from "@nestjs/common";
import {IAccessService} from "../../service/access.service.interface";
import {IAuthService} from "../../service/auth.service.interface";
import {PostDto} from "../content/dto/post.dto";
import {OffchainDataService} from "./offchain-data.service";

@Injectable({scope: Scope.REQUEST})
export class OffchainPostAccessService implements IAccessService {

    constructor(
        @Inject(IAuthService) private readonly authService: IAuthService,
        @Inject(OffchainDataService) private readonly offchainDataService: OffchainDataService
    ) { }

    async hasAccessTo(postHashes: string[]) {
        const accessHashes = await this.offchainDataService.getUserAccessAllowed(this.authService.authenticatedAddress);
        return postHashes.every(hash => accessHashes.includes(hash));
    }

    allowedToUpload(post: PostDto) {
        const address = this.authService.authenticatedAddress;
        return post.authorAddress === address;
    }

    async getIntegrousPostHash(post: PostDto): Promise<string> {
        return this.offchainDataService.calculatePostHash(post);
    }
}
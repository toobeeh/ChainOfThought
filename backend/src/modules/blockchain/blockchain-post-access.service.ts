import {Inject, Injectable, PreconditionFailedException, Scope} from '@nestjs/common';
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {IAuthService} from "../../service/auth.service.interface";
import {PostDto} from "../../dto/post.dto";
import {ChainOfThought} from "../../../types/ethers-contracts";
import {IAccessService} from "../../service/access.service.interface";

@Injectable({scope: Scope.REQUEST})
export class BlockchainPostAccessService implements IAccessService {

    constructor(
        @Inject(IAuthService) private readonly authService: IAuthService,
        private readonly chainOfThoughtService: ChainOfThoughtService
    ) { }

    async hasAccessTo(postHashes: string[]) {
        const contract = await this.chainOfThoughtService.getContract();
        const address = this.authService.authenticatedAddress;
        const accessHashes = await contract.getAccessAllowedPostsOfUser(address);

        return postHashes.every(postHash => accessHashes.includes(postHash));
    }

    allowedToUpload(post: PostDto) {
        const address = this.authService.authenticatedAddress;
        return post.authorAddress === address;
    }

    async getIntegrousPostHash(post: PostDto): Promise<string> {
        const contract = await this.chainOfThoughtService.getContract();

        // calculate hash for provided data
        const expectedHash = await contract.getPostHash(post.title, post.content, new Uint8Array(0), post.psHash, post.authorAddress, post.timestamp);

        // check if post exists on-chain
        let postStats: Awaited<ReturnType<ChainOfThought["getPostStats"]>>;
        try {
            postStats = await contract.getPostStats(expectedHash);
        } catch (e) {
            throw new PreconditionFailedException(`Post with expected hash ${expectedHash} does not exist on-chain`);
        }

        // check if authors match
        if (postStats.author !== post.authorAddress) {
            throw new PreconditionFailedException(`Post author ${post.authorAddress} does not match on-chain author ${postStats.author}`);
        }

        return expectedHash;
    }
}
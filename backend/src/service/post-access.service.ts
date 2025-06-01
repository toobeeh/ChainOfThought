import {Injectable, PreconditionFailedException, Scope} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {PostDto} from "../dto/post.dto";
import {toBytesN} from "../util/toBytesN";
import {ChainOfThought} from "../../types/ethers-contracts";

@Injectable({scope: Scope.REQUEST})
export class PostAccessService {

    constructor(
        private readonly authService: AuthService,
        private readonly chainOfThoughtService: ChainOfThoughtService
    ) { }

    public async hasAccessTo(postHashes: string[]){
        const contract = await this.chainOfThoughtService.getContract();
        const address = this.authService.authenticatedAddress;
        const accessHashes = await contract.getAccessAllowedPostsOfUser(address);

        return postHashes.every(postHash => accessHashes.includes(postHash));
    }

    public allowedToUpload(post: PostDto){
        const address = this.authService.authenticatedAddress;
        return post.authorAddress === address;
    }

    public async getIntegrousPostHash(post: PostDto): Promise<string>{
        const contract = await this.chainOfThoughtService.getContract();

        // calculate hash for provided data
        const expectedHash = await contract.getPostHash(post.title, post.content,  new Uint8Array(0), toBytesN("", 32), post.authorAddress, post.timestamp);

        // check if post exists on-chain
        let postStats: Awaited<ReturnType<ChainOfThought["getPostStats"]>>;
        try {
            postStats = await contract.getPostStats(expectedHash);
        }
        catch (e) {
            throw new PreconditionFailedException(`Post with expected hash ${expectedHash} does not exist on-chain`);
        }

        // check if authors match
        if(postStats.author !== post.authorAddress){
            throw new PreconditionFailedException(`Post author ${post.authorAddress} does not match on-chain author ${postStats.author}`);
        }

        return expectedHash;
    }

}
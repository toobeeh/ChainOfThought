import {Injectable, Scope} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";

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

}
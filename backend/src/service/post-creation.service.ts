import {Injectable, Scope} from "@nestjs/common";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {PostPublishedEvent} from "../../types/ethers-contracts/ChainOfThought";
import {PostContentService} from "./post-content.service";
import {PostEntity} from "../entities/post.entity";

@Injectable()
export class PostCreationService {

    constructor(
        private readonly chainOfThoughtService: ChainOfThoughtService,
        private readonly postContentService: PostContentService
    ) { }

    public async listenForCreatedPosts(){
        const contract = await this.chainOfThoughtService.getContract();
        await contract.on(contract.filters.PostPublished, async (hash, author, event, meta) => {
            /*const post = new PostEntity();
            post.title = event.title;
            post.content = event.content;
            post.icon = event.icon;
            post.hash = hash;
            post.authorAddress = author;
            post.psHash = event.referencedPostHash;
            post.timestamp = Number(event.timestamp.toString());
            await this.postContentService.create(post);*/
        });
    }

}
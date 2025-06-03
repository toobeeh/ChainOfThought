import {Inject, Injectable} from "@angular/core";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {BehaviorSubject, filter, firstValueFrom, map, Observable, of, Subject, timeout} from "rxjs";
import {toBytesN} from "../../util/toBytesN";
import {PostStatsStruct} from "../../../types/ethers-contracts/ChainOfThought";

export interface recordedPublishedPost{
    authorAddress: string;
    postHash: string;
    transactionHash: string;
    timestamp: number;
}

export enum PostFilterType {
    All,
    Favorite,
    Own,
    Read
}

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    constructor(
        @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService
    ) { }

    /**
     * Creates an observable that listens for PostPublished events from the blockchain and stops listening when unsubscribed
     */
    public async recordPublishedPosts() {
        const recordedPosts: recordedPublishedPost[] = [];
        const posts = new BehaviorSubject<recordedPublishedPost[]>([]);

        const contract = await this.chainOfThoughtService.getContract();
        const unsubscribe = await this.chainOfThoughtService.getEvents(
            contract,
            contract.filters.PostPublished,
            (postHash, authorAddress, timestamp, meta) => {
                recordedPosts.push({
                    postHash,
                    authorAddress,
                    timestamp: Number(timestamp),
                    transactionHash: (meta as any).log.transactionHash}); /* wrong typed? */
                posts.next([...recordedPosts]);
        });

        return new Observable<recordedPublishedPost[]>(subscriber => {
            subscriber.next([...recordedPosts]);
            const subscription = posts.subscribe({
                next: (posts) => subscriber.next(posts),
                error: (err) => subscriber.error(err),
                complete: () => subscriber.complete()
            });

            return () => {
                unsubscribe();
                subscription.unsubscribe();
            };
        })
    }

    public async publishPost(
        title: string,
        content: string,
        iconBytes: Uint8Array<ArrayBuffer> = new Uint8Array(0),
        psHash: string = ""
    ): Promise<recordedPublishedPost> {

        /* record published posts to avoid race conditions */
        const posts$ = await this.recordPublishedPosts();
        const contract = await this.chainOfThoughtService.getContract();

        const transaction = await contract.publishPost(title, content, iconBytes, psHash)

        const resultPost = await firstValueFrom(posts$.pipe(
            map(posts => posts.find(post => post.transactionHash === transaction.hash)),
            filter(post => post !== undefined),
            timeout({each: 30000, with: () => of(undefined)}) // wait for up to 20 seconds for the post to be recorded
        ));

        if(resultPost === undefined) {
            throw new Error("Published post not found in recorded posts within 30 seconds");
        }

        return resultPost;
    }

    public async getPostCostEstimate(
        title: string,
        content: string,
        iconBytes: Uint8Array<ArrayBuffer> = new Uint8Array(0),
        psHash: string = ""
    ): Promise<number> {
        const contract = await this.chainOfThoughtService.getContract();
        const estimate = await contract.estimatePostCost(title, content, iconBytes, toBytesN(psHash, 32));
        return Number(estimate);
    }

    public async getPublishedPostHashes(filter: PostFilterType): Promise<string[]> {
        const contract = await this.chainOfThoughtService.getContract();

        if(filter === PostFilterType.All){
            return await contract.allPosts();
        }

        else if(filter === PostFilterType.Favorite){
            return await contract.userFavoritePosts();
        }

        else if (filter === PostFilterType.Read){
            return await contract.userAccessedPosts();
        }

        else return await contract.userWrittenPosts();
    }

    public async getAuthorAlias(address: string): Promise<string> {
        const contract = await this.chainOfThoughtService.getContract();
        return await contract.getAliasOf(address);
    }

    public async unlockPost(postHash: string): Promise<void> {
        const contract = await this.chainOfThoughtService.getContract();
        await contract.addPostToAccessList(postHash);
    }

    public async addPostToFavorites(postHash: string): Promise<void> {
        const contract = await this.chainOfThoughtService.getContract();
        await contract.addPostToFavorites(postHash);
    }

    public async getPostStats(postHash: string): Promise<PostStatsStruct> {
        const contract = await this.chainOfThoughtService.getContract();
        return await contract.getPostStats(postHash);
    }
}

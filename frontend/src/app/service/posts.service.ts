import {Inject, Injectable} from "@angular/core";
import {ChainOfThought, ChainOfThought__factory} from "../../../types/ethers-contracts";
import {PostPublishedEvent} from "../../../types/ethers-contracts/ChainOfThought";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {BehaviorSubject, Observable, Subject} from "rxjs";

export interface recordedPublishedPost{
    authorAddress: string;
    postHash: string;
    transactionHash: string;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class PostsService {

    private _contract: ChainOfThought | undefined;

    constructor(
        @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService
    ) { }

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
}

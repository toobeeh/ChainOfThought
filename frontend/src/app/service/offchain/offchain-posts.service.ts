import {Inject, Injectable} from "@angular/core";
import {ChainOfThoughtService} from "../chain-of-thought.service";
import {
    BehaviorSubject, distinctUntilChanged,
    filter,
    firstValueFrom,
    interval,
    map,
    mergeWith,
    Observable,
    of, pairwise, scan, skip,
    Subject, switchMap,
    timeout
} from "rxjs";
import {toBytesN} from "../../../util/toBytesN";
import {PostStatsStruct} from "../../../../types/ethers-contracts/ChainOfThought";
import {IPostsService, PostFilterType, recordedPublishedPost} from "../posts.service.interface";
import {PostsService} from "../../../../api/api/posts.service";
import {ListingService, PublishService, UserService} from "../../../../api";
import {OffchainAuthorService} from "./offchain-author.service";

@Injectable({
    providedIn: 'root'
})
export class OffchainPostsService implements IPostsService {

    private readonly _postPublished$ = new Subject<recordedPublishedPost>();

    constructor(
        @Inject(ListingService) private listingService: ListingService,
        @Inject(UserService) private userService: UserService,
        @Inject(PublishService) private publishService: PublishService,
        @Inject(OffchainAuthorService) private authorService: OffchainAuthorService
    ) { }

    /**
     * Creates an observable that polls for posts or self-published posts
     */
    public async recordPublishedPosts() {
        return this._postPublished$.pipe(
            mergeWith(interval(10000).pipe(
                switchMap(() => this.listingService.findPosts()),
                distinctUntilChanged((prev, curr) => prev.length === curr.length),
                pairwise(),
                map(([prev, curr]) =>
                    curr.filter(newHash => !prev.some(oldHash => oldHash === newHash)).shift()
                ),
                filter(newHash => newHash !== undefined),
                switchMap(async hash => {
                    const stats = await firstValueFrom(this.listingService.getPostStats(hash.hash));
                    return {
                        postHash: hash.hash,
                        authorAddress: stats.author,
                        timestamp: Date.now(),
                        transactionHash: "PLACEHOLDER"
                    } as recordedPublishedPost;
                })
            )),
            scan((all, value) => [...all, value], [] as recordedPublishedPost[])
        );
    }

    public async publishPost(
        title: string,
        content: string,
        iconBytes: Uint8Array<ArrayBuffer> = new Uint8Array(0),
        psHash: string = ""
    ): Promise<recordedPublishedPost> {

        const post = await firstValueFrom(this.publishService.postDraft({
            title,
            content,
            icon: iconBytes.length > 0 ? btoa(String.fromCharCode(...iconBytes)) : undefined,
            psHash: psHash.length > 0 ? psHash : undefined
        }));

        const recordedPost: recordedPublishedPost = {
            postHash: post.hash,
            authorAddress: post.authorAddress,
            timestamp: post.timestamp,
            transactionHash: "PLACEHOLDER"
        };

        this._postPublished$.next(recordedPost);
        await this.authorService.refreshAuthor();
        return recordedPost;
    }

    public async getPostCostEstimate(
        title: string,
        content: string,
        iconBytes: Uint8Array<ArrayBuffer> = new Uint8Array(0),
        psHash: string = ""
    ): Promise<number> {
        return await firstValueFrom(this.publishService.estimatePostCost({
            title,
            content,
            icon: iconBytes.length > 0 ? btoa(String.fromCharCode(...iconBytes)) : undefined,
            psHash: psHash.length > 0 ? psHash : undefined
        }).pipe(
            map(estimate => estimate.cost)
        ));
    }

    public async getPublishedPostHashes(filter: PostFilterType): Promise<string[]> {

        if(filter === PostFilterType.All){
            return await firstValueFrom(this.listingService.findPosts().pipe(
                map(posts => posts.map(post => post.hash))
            ));
        }

        else if(filter === PostFilterType.Favorite){
            return await firstValueFrom(this.listingService.getFavorites().pipe(
                map(posts => posts.map(post => post.hash))
            ));
        }

        else if (filter === PostFilterType.Read){
            return await firstValueFrom(this.listingService.getAccesses().pipe(
                map(posts => posts.map(post => post.hash))
            ));
        }

        else return await firstValueFrom(this.listingService.getWritten().pipe(
            map(posts => posts.map(post => post.hash))
        ));
    }

    public async getAuthorAlias(address: string): Promise<string> {
        return await firstValueFrom(this.userService.getUser(address).pipe(
            map(user => user.alias ?? address)
        ));
    }

    public async unlockPost(postHash: string): Promise<void> {
        await firstValueFrom(this.listingService.accessPost(postHash));
        await this.authorService.refreshAuthor();
    }

    public async addPostToFavorites(postHash: string): Promise<void> {
        await firstValueFrom(this.listingService.favoritePost(postHash));
        await this.authorService.refreshAuthor();
    }

    public async getPostStats(postHash: string): Promise<PostStatsStruct> {
        return await firstValueFrom(this.listingService.getPostStats(postHash).pipe(
            map(stats => ({
                favorites: stats.favorites,
                accesses: stats.accesses,
                references: stats.references,
                referencedPostHash: stats.referencedPost ?? "",
                hidden: stats.hidden,
                author: stats.author
            }))
        ));
    }
}

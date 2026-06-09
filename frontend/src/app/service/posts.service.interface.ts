import {InjectionToken} from "@angular/core";
import {Observable} from "rxjs";
import {PostStatsStruct} from "../../../types/ethers-contracts/ChainOfThought";

export const IPostsService = new InjectionToken("IPostsService");

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

export interface IPostsService {
    recordPublishedPosts(): Promise<Observable<recordedPublishedPost[]>>;
    publishPost(title: string, content: string, iconBytes?: Uint8Array, psHash?: string): Promise<recordedPublishedPost>;
    getPostCostEstimate(title: string, content: string, iconBytes?: Uint8Array, psHash?: string): Promise<number>;
    getPublishedPostHashes(filter: PostFilterType): Promise<string[]>;
    getAuthorAlias(address: string): Promise<string>;
    unlockPost(postHash: string): Promise<void>;
    addPostToFavorites(postHash: string): Promise<void>;
    getPostStats(postHash: string): Promise<PostStatsStruct>;
}
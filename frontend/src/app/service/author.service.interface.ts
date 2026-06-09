import {InjectionToken} from "@angular/core";
import {Observable} from "rxjs";

export const IAuthorService = new InjectionToken("IAuthorService");

export interface author {
    alias: string;
    balance: number;
    address: string;
    rewardAvailable: boolean;
    rewardTime: number;
    rewardAmount: number;
    renamePrice: number;
    tokenPrice: bigint;
    accessPrice: number;
    accessList: string[];
    favorites: string[];
}

export interface IAuthorService {
    ensureInitialized(): Promise<void>;
    ensureDestroyed(): Promise<void>;
    readonly author$: Observable<author>;
    renameAuthor(newAlias: string): Promise<void>;
    buyTokens(amount: number): Promise<void>;
    claimReward(): Promise<void>;
}
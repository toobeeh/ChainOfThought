import {Inject, Injectable} from '@angular/core';
import {
    BehaviorSubject,
    combineLatest,
    filter,
    firstValueFrom,
    map,
    Observable, of,
    tap
} from "rxjs";
import {Web3Service} from "./web3.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {toBytesN} from "../../util/toBytesN";
import {ethers, toBigInt} from "ethers";
import {ChainOfThought} from "../../../types/ethers-contracts/ChainOfThought";

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

@Injectable({
    providedIn: 'root'
})
export class AuthorService {

    private _author$ = new BehaviorSubject<author | undefined>(undefined);
    private _unsubscribeListeners?: () => void;
    private initiated = false;

    constructor(
        @Inject(Web3Service) private web3Service: Web3Service,
        @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService
    ) { }

    public async ensureInitialized(): Promise<void> {
        if(!this.initiated) await this.init();
    }

    public async ensureDestroyed(): Promise<void> {
        if(this.initiated) this.destroy();
    }

    private async init() {
        this.initiated = true;
        const contract = await this.chainOfThoughtService.getContract();

        const unsubAlias = await this.listenForAliasChange(contract);
        const unsubBalance = await this.listenForBalanceChange(contract);
        const unsubFavorized = await this.listenForPostFavorized(contract);
        const unsubPublished = await this.listenForPostPublished(contract);
        const unsubAccessed = await this.listenForPostAccessed(contract);

        this._unsubscribeListeners = () => {
            unsubAlias();
            unsubBalance();
            unsubFavorized();
            unsubPublished();
            unsubAccessed();
        };

        await this.loadAuthor(contract);
    }

    private destroy() {
        this.initiated = false;
        this._author$.next(undefined);
        this._unsubscribeListeners?.();
    }

    private async loadAuthor(contract: ChainOfThought) {
        const address = await (await this.web3Service.getRequiredSigner()).getAddress();

        /* collect author data */
        const observable = combineLatest([
            contract.getAlias(),
            of(address),
            contract.getTokenBalance(),
            contract.rewardAvailable(),
            contract.getRewardInterval(),
            contract.getRewardAmount(),
            contract.getRenamePrice(),
            contract.getTokenValue(),
            contract.getAccessPrice(),
            contract.getAccessAllowedPostsOfUser(address),
            contract.userFavoritePosts()
        ]).pipe(

            /* map to author when all emitted */
            map(([alias, address, balance, rewardAvailable, rewardTime, rewardAmount, renamePrice, tokenPrice, accessPrice, accessList, favorites]) => {
                const author: author = {
                    alias,
                    balance: parseFloat(balance.toString()),
                    address,
                    rewardAvailable,
                    rewardTime: Number(rewardTime),
                    rewardAmount: Number(rewardAmount),
                    renamePrice: Number(renamePrice),
                    tokenPrice,
                    accessPrice: Number(accessPrice),
                    accessList,
                    favorites
                };
                return author;
            }),
            tap(data => this._author$.next(data))
        );


        /* return result immediately */
        return firstValueFrom(observable);
    }

    public get author$(): Observable<author> {
        return this._author$.pipe(
            filter(author => author !== undefined)
        );
    }

    public async renameAuthor(newAlias: string): Promise<void> {
        const contract = await this.chainOfThoughtService.getContract();
        await contract.changeAlias(toBytesN(newAlias, 20));
    }

    public async buyTokens(amount: number): Promise<void> {
        const contract = await this.chainOfThoughtService.getContract();
        const cost = await contract.getTokenValue() * toBigInt(amount);
        await contract.buyTokens({value: cost});
    }

    public async claimReward(): Promise<void> {
        const contract = await this.chainOfThoughtService.getContract();
        await contract.claimReward();
    }

    private listenForAliasChange(contract: ChainOfThought) {
        return this.chainOfThoughtService.getEvents(contract, contract.filters.AliasChanged, (address, alias) => {
            const currentAuthor = this._author$.getValue();
            if(currentAuthor?.address === address) {
                this._author$.next({
                    ...currentAuthor,
                    alias: ethers.toUtf8String(alias)
                });
            }
        });
    }

    private listenForBalanceChange(contract: ChainOfThought) {
        return this.chainOfThoughtService.getEvents(contract, contract.filters.UserBalanceChanged, (address, balance) => {
            const currentAuthor = this._author$.getValue();
            if(currentAuthor?.address === address) {
                this._author$.next({
                    ...currentAuthor,
                    balance: Number(balance)
                });
            }
        });
    }

    private listenForPostFavorized(contract: ChainOfThought) {
        return this.chainOfThoughtService.getEvents(contract, contract.filters.PostFavorized, (postHash, address) => {
            const currentAuthor = this._author$.getValue();
            if(currentAuthor?.address === address) {
                this._author$.next({
                    ...currentAuthor,
                    favorites: [...currentAuthor.favorites, postHash],
                });
            }
        });
    }

    private listenForPostPublished(contract: ChainOfThought) {
        return this.chainOfThoughtService.getEvents(contract, contract.filters.PostPublished, (postHash, address) => {
            const currentAuthor = this._author$.getValue();
            if(currentAuthor?.address === address) {
                this._author$.next({
                    ...currentAuthor,
                    accessList: [...currentAuthor.accessList, postHash],
                });
            }
        });
    }

    private listenForPostAccessed(contract: ChainOfThought) {
        return this.chainOfThoughtService.getEvents(contract, contract.filters.PostAccessed, (postHash, address) => {
            const currentAuthor = this._author$.getValue();
            if(currentAuthor?.address === address) {
                this._author$.next({
                    ...currentAuthor,
                    accessList: [...currentAuthor.accessList, postHash],
                });
            }
        });
    }

}

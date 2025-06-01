import {Inject, Injectable} from '@angular/core';
import {
    BehaviorSubject,
    combineLatest,
    combineLatestWith,
    filter,
    firstValueFrom,
    map,
    Observable, of,
    switchMap,
    tap
} from "rxjs";
import {Web3Service} from "./web3.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {toBytesN} from "../../util/toBytesN";
import {toBigInt} from "ethers";

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
}

@Injectable({
    providedIn: 'root'
})
export class AuthorService {

    private _author$ = new BehaviorSubject<author | undefined>(undefined);

    constructor(
        @Inject(Web3Service) private web3Service: Web3Service,
        @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService
    ) { }

    public async loadAuthor() {

        const contract = await this.chainOfThoughtService.getContract();
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
            contract.getAccessAllowedPostsOfUser(address)
        ]).pipe(

            /* map to author when all emitted */
            map(([alias, address, balance, rewardAvailable, rewardTime, rewardAmount, renamePrice, tokenPrice, accessPrice, accessList]) => {
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
                    accessList
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

}

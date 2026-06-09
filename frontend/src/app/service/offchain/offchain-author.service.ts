import {Inject, Injectable} from "@angular/core";
import {author, IAuthorService} from "../author.service.interface";
import {BehaviorSubject, filter, firstValueFrom, Observable} from "rxjs";
import {IAuthService} from "../auth.service.interface";
import {ListingService, UserService} from "../../../../api";

@Injectable({
    providedIn: 'root'
})
export class OffchainAuthorService implements IAuthorService {

    private _author$ = new BehaviorSubject<author | undefined>(undefined);
    private initiated = false;

    constructor(
        @Inject(IAuthService) private authService: IAuthService,
        @Inject(UserService) private userService: UserService,
        @Inject(ListingService) private listingService: ListingService
    ) { }

    /**
     * Equivalent of loading author data from the blockchain
     */
    public async ensureInitialized(): Promise<void> {
        if(!this.initiated) {
            await this.loadAuthor();
        }
    }

    /**
     * Unload author data to cleanup for next login
     */
    public async ensureDestroyed(): Promise<void> {
        this._author$.next(undefined);
        this.initiated = false;
        return;
    }

    private async loadAuthor(): Promise<author> {
        if(! await this.authService.isAuthenticated()){
            await this.authService.authenticate();
        }

        const address = await this.authService.getAddress();
        if(address === undefined) {
            throw new Error("No address found for current user");
        }

        const settings = await firstValueFrom(this.listingService.getSettings());
        const user = await firstValueFrom(this.userService.getUser(address));
        const favorites = await firstValueFrom(this.listingService.getFavorites());
        const accessList = await firstValueFrom(this.listingService.getUserAccessAllowed());

        const authorData: author = {
            alias: user.alias ?? address,
            balance: user.balance,
            address: address,
            rewardAvailable: user.rewardAvailable,
            rewardTime: settings.rewardTime,
            rewardAmount: settings.rewardAmount,
            renamePrice: settings.renamePrice,
            tokenPrice: BigInt(0), // Token price is not relevant in the offchain version
            accessPrice: settings.accessPrice,
            accessList: accessList.map(fav => fav.hash),
            favorites: favorites.map(fav => fav.hash)
        };

        this._author$.next(authorData);
        this.initiated = true;
        return authorData;
    }

    /**
     * Not needed in the blockchain version because of event listeners
     */
    public async refreshAuthor(): Promise<void> {
        await this.loadAuthor();
    }

    public get author$(): Observable<author> {
        return this._author$.pipe(
            filter(author => author !== undefined)
        );
    }

    /**
     * Equivalent of rename author transaction, but done via API call
     * @param newAlias
     */
    public async renameAuthor(newAlias: string): Promise<void> {
        const address = await this.authService.getAddress();
        if(address === undefined) {
            throw new Error("No address found for current user");
        }
        await firstValueFrom(this.userService.changeAlias(address, {
            alias: newAlias
        }));
        await this.refreshAuthor();
    }

    /**
     * No equivalent to buying tokens via crypto currency
     * @param amount
     */
    public async buyTokens(amount: number): Promise<void> {
        alert("Buying tokens is not implemented in the offchain version.");
    }

    /**
     * Equivalent of claiming rewards via blockchain transaction, but done via API call
     */
    public async claimReward(): Promise<void> {
        const address = await this.authService.getAddress();
        if(address === undefined) {
            throw new Error("No address found for current user");
        }
        await firstValueFrom(this.userService.claimReward(address));
        await this.refreshAuthor();
    }

}
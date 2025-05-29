import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, combineLatest, combineLatestWith, filter, firstValueFrom, map, Observable, tap} from "rxjs";
import {Web3Service} from "./web3.service";
import {ChainOfThoughtService} from "./chain-of-thought.service";
import {fromPromise} from "rxjs/internal/observable/innerFrom";

export interface author {
  alias: string;
  balance: number;
  address: string;
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

    /* collect author data */
    const observable = combineLatest([
        this.chainOfThoughtService.contract.getAlias(),
        this.web3Service.getRequiredSigner().getAddress(),
        this.chainOfThoughtService.contract.getTokenBalance()
    ]).pipe(

        /* map to author when all emitted */
        map(([alias, address, balance]) => {
            const author: author = {
                alias,
                balance: parseFloat(balance.toString()),
                address
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
}

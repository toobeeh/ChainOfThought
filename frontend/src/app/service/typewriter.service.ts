import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {

  private _finishedWriters$ = new Subject<string>();

  constructor() { }

  public writerHasFinished(key: string) {
    this._finishedWriters$.next(key);
  }

  public get finishedWriters$() {
    return this._finishedWriters$.asObservable();
  }
}

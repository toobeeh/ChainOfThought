import {Component, Inject} from '@angular/core';
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {author, AuthorService} from "../../service/author.service";
import {firstValueFrom, map, Observable, switchMap} from "rxjs";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {Router} from "@angular/router";
import {toBytes20} from "../../../util/toBytes20";

@Component({
  selector: 'app-alias',
  imports: [
    TypewriterComponent,
    AsyncPipe,
    ButtonComponent,
    NgIf,
    WhenWriterFinishedDirective
  ],
  templateUrl: './alias.component.html',
  standalone: true,
  styleUrl: './alias.component.css'
})
export class AliasComponent {

  changeCost$: Observable<number>;
  author$: Observable<author>;

  constructor(
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
    this.changeCost$ = fromPromise(this.chainOfThoughtService.getContract()).pipe(
        switchMap(contract => contract.getRenamePrice()),
        map(value => parseFloat(value.toString()))
    );
  }

  public async rename(newAlias: string) {
    if(newAlias.length < 1 || newAlias.length > 20) {
      alert("Alias must be between 1 and 20 characters.");
      return;
    }

    const observable= fromPromise(this.chainOfThoughtService.getContract()).pipe(
      switchMap(contract => contract.changeAlias(toBytes20(newAlias))),
    );

    try {
      await firstValueFrom(observable);
      alert("Alias changed successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }
}

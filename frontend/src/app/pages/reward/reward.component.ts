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
import {toBytesN} from "../../../util/toBytesN";

@Component({
  selector: 'app-reward',
  imports: [
    TypewriterComponent,
    AsyncPipe,
    ButtonComponent,
    NgIf,
    WhenWriterFinishedDirective
  ],
  templateUrl: './reward.component.html',
  standalone: true,
  styleUrl: './reward.component.css'
})
export class RewardComponent {

  rewardTime$: Observable<number>;
  rewardAmount$: Observable<number>;
  author$: Observable<author>;

  constructor(
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
    this.rewardTime$ = fromPromise(this.chainOfThoughtService.getContract()).pipe(
        switchMap(contract => contract.getRewardInterval()),
        map(value => parseFloat(value.toString()))
    );
    this.rewardAmount$ = fromPromise(this.chainOfThoughtService.getContract()).pipe(
        switchMap(contract => contract.getRewardAmount()),
        map(value => parseFloat(value.toString()))
    );
  }

  public async getReward() {
    const observable= fromPromise(this.chainOfThoughtService.getContract()).pipe(
      switchMap(contract => contract.claimReward()),
    );

    try {
      await firstValueFrom(observable);
      alert("Reward received successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }

  formatSeconds(seconds: number): string {
    // format seconds to hh:mm:ss
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [(hours > 0 ? `${hours}h` : ""), (minutes > 0 ? `${minutes}m` : ""), (secs > 0 ? `${secs}s` : "")].join(" ").trim();
  }
}

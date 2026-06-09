import {Component, Inject} from '@angular/core';
import {author} from "../../service/author.service.interface";
import {Observable} from "rxjs";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {Router} from "@angular/router";
import {IAuthorService} from "../../service/author.service.interface";

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

  author$: Observable<author>;

  constructor(
      @Inject(IAuthorService) private authorService: IAuthorService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
  }

  public async claimReward() {
    try {
      await this.authorService.claimReward();
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

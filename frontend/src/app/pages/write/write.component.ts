import {Component, Inject} from '@angular/core';
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {author, AuthorService} from "../../service/author.service";
import {map, Observable, switchMap} from "rxjs";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {Router} from "@angular/router";
import {toBytesN} from "../../../util/toBytesN";
import {PostsService} from "../../service/posts.service";

@Component({
  selector: 'app-write',
  imports: [
    TypewriterComponent,
    ButtonComponent,
    WhenWriterFinishedDirective
  ],
  templateUrl: './write.component.html',
  standalone: true,
  styleUrl: './write.component.css'
})
export class WriteComponent {

  changeCost$: Observable<number>;
  author$: Observable<author>;


  constructor(
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(PostsService) private postsService: PostsService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
    this.changeCost$ = fromPromise(this.chainOfThoughtService.getContract()).pipe(
        switchMap(contract => contract.getRenamePrice()),
        map(value => parseFloat(value.toString()))
    );
  }

  public async share(title: string, content: string) {
    if(title.length < 1 || title.length > 50) {
      alert("Title must be between 1 and 50 characters.");
      return;
    }

    if(content.length < 1) {
      alert("Content must not be empty.");
      return;
    }

    const estimate = await this.postsService.getPostCostEstimate(title, content, new Uint8Array(0), toBytesN("", 32));
    const confirmed = confirm(`This post will cost ${estimate.toString()} thought tokens. Do you want to proceed?`);
    if (!confirmed) {
      return;
    }

    try {
      const post = await this.postsService.publishPost(title, content, new Uint8Array(0), toBytesN("", 32));
      console.log(post);

      alert("Thoughts shared successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }
}

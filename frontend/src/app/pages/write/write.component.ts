import {Component, Inject} from '@angular/core';
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {author, AuthorService} from "../../service/author.service";
import {BehaviorSubject, filter, firstValueFrom, map, Observable, switchMap, tap} from "rxjs";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {Router} from "@angular/router";
import {toBytesN} from "../../../util/toBytesN";
import {Web3Service} from "../../service/web3.service";
import {PostsService} from "../../service/posts.service";

@Component({
  selector: 'app-write',
  imports: [
    TypewriterComponent,
    AsyncPipe,
    ButtonComponent,
    NgIf,
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

    const estimate = await (await this.chainOfThoughtService.getContract()).estimatePostCost(title, content, new Uint8Array(0), toBytesN("", 32));
    const confirmed = confirm(`This post will cost ${estimate.toString()} thought tokens. Do you want to proceed?`);
    if (!confirmed) {
      return;
    }

    const posts = await this.postsService.recordPublishedPosts();

    const observable= fromPromise(
        this.chainOfThoughtService.getContract()
    ).pipe(
        switchMap(contract => contract.publishPost(title, content, new Uint8Array(0), toBytesN("", 32))),
    );

    try {
      const result = await firstValueFrom(observable);

      const resultPost = await firstValueFrom(posts.pipe(
          map(posts => posts.find(post => post.transactionHash === result.hash)),
          filter(post => post !== undefined),
      ));

      console.log(resultPost);

      alert("Thoughts shared successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }
}

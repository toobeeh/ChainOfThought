import {Component, Inject} from '@angular/core';
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {author, AuthorService} from "../../service/author.service";
import {firstValueFrom, map, Observable, of, switchMap} from "rxjs";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ActivatedRoute, Router} from "@angular/router";
import {toBytesN} from "../../../util/toBytesN";
import {PostsService} from "../../service/posts.service";
import {PostPreviewDto, PostsService as PostsContentService} from "../../../../api"
import {AsyncPipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-write',
  imports: [
    TypewriterComponent,
    ButtonComponent,
    WhenWriterFinishedDirective,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './write.component.html',
  standalone: true,
  styleUrl: './write.component.css'
})
export class WriteComponent {

  author$: Observable<author>;
  ps$: Observable<PostPreviewDto | undefined>;

  constructor(
      @Inject(PostsService) private postsService: PostsService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(Router) private router: Router,
      @Inject(ActivatedRoute) private route: ActivatedRoute,
      @Inject(PostsContentService) private postsContentService: PostsContentService
  ) {
    this.author$ = this.authorService.author$;
    this.ps$ = this.route.queryParamMap.pipe(
        map(param => param.get('ps')),
        switchMap((ps) => ps === null ? of(undefined) : this.postsContentService.findPostPreviews({hashes: [ps]})),
        map((previews) => previews && previews.length > 0 ? previews[0] : undefined)
    );
  }

  public async share(title: string, content: string, psHash?: string | undefined) {
    if(title.length < 1 || title.length > 50) {
      alert("Title must be between 1 and 50 characters."); // TODO: test post constraints in blockchain tests
      return;
    }

    if(content.length < 1) {
      alert("Content must not be empty.");
      return;
    }

    psHash ??= toBytesN("", 32);

    const estimate = await this.postsService.getPostCostEstimate(title, content, new Uint8Array(0), psHash);
    const confirmed = confirm(`This post will cost ${estimate.toString()} thought tokens. Do you want to proceed?`);
    if (!confirmed) {
      return;
    }

    try {
      const post = await this.postsService.publishPost(title, content, new Uint8Array(0), psHash);

      /* upload post content with received hash and metadata (to perform hash checks in backend) */
      await firstValueFrom(this.postsContentService.uploadPostContent({
        title: title,
        content: content,
        timestamp: post.timestamp,
        authorAddress: post.authorAddress,
        hash: post.postHash,
        icon: "",
        psHash
      }));

      alert("Thoughts shared successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }
}

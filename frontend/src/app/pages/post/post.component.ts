import {Component, Inject, OnInit} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {PostDto, PostPreviewDto, PostsService as PostsContentService} from "../../../../api";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, catchError, firstValueFrom, map, Observable, of, switchMap} from "rxjs";
import {AsyncPipe, DatePipe, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts.service";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ButtonComponent} from "../../components/button/button.component";
import {author, AuthorService} from "../../service/author.service";
import {PostStatsStruct} from "../../../../types/ethers-contracts/ChainOfThought";

@Component({
  selector: 'app-post',
    imports: [
        TypewriterComponent,
        AsyncPipe,
        NgIf,
        WhenWriterFinishedDirective,
        DatePipe,
        ButtonComponent
    ],
  templateUrl: './post.component.html',
  standalone: true,
  styleUrl: './post.component.css'
})
export class PostComponent implements OnInit {

  protected data$?: Observable<{post?: PostDto, alias: string, preview?: PostPreviewDto}>;
  protected stats$?: Observable<{author: author, post: PostStatsStruct}>;

  constructor(
      @Inject(PostsContentService) private postsContentService: PostsContentService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(PostsService) private postsService: PostsService,
      @Inject(ActivatedRoute) private route: ActivatedRoute,
      @Inject(Router) private router: Router
  ) {
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('postHash');
    if(postId === null) {
      this.router.navigate(['/read']);
      return;
    }

    this.data$ = this.postsContentService.getPostByHash(postId).pipe(
        map(post => ({post: post, preview: undefined})),
        catchError(() => this.postsContentService.findPostPreviews({hashes: [postId]}).pipe(
                map(posts => ({preview: posts[0], post: undefined}))
            )
        ),
        switchMap(data => {
          return fromPromise(this.getAuthorAlias((data.post ?? data.preview).authorAddress)).pipe(
            switchMap(alias => {
              return of({...data, alias} as {post?: PostDto, alias: string, preview?: PostPreviewDto});
            })
          );
        }),
    );

      this.stats$ = this.authorService.author$.pipe(
          switchMap(author => fromPromise(this.postsService.getPostStats(postId)).pipe(
              map((stats) => ({author, post: stats})
          ))
      ));
  }

  getAuthorAlias(address: string): Promise<string> {
    return this.postsService.getAuthorAlias(address);
  }

  trim(text: string){
      return text.replaceAll('\x00','');
  }

  async addFavorite(postHash: string) {
      await this.postsService.addPostToFavorites(postHash);
      alert(`Thought added to favorites`);
  }

  async unlockPost(hash: string) {
      await this.postsService.unlockPost(hash);
      this.ngOnInit();
  }

}

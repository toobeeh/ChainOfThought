import {Component, Inject, OnInit} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {PostDto, PostsService as PostsContentService} from "../../../../api";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, catchError, firstValueFrom, Observable, of, switchMap} from "rxjs";
import {AsyncPipe, DatePipe, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts.service";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ButtonComponent} from "../../components/button/button.component";
import {author, AuthorService} from "../../service/author.service";

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

  protected post?: Promise<[PostDto, string]>;
  protected author$: Observable<author>;

  constructor(
      @Inject(PostsContentService) private postsContentService: PostsContentService,
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(PostsService) private postsService: PostsService,
      @Inject(ActivatedRoute) private route: ActivatedRoute,
      @Inject(Router) private router: Router
  ) {
      this.author$ = this.authorService.author$;
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('postHash');
    if(postId === null) {
      this.router.navigate(['/read']);
      return;
    }

    this.post = firstValueFrom(this.postsContentService.getPostByHash(postId).pipe(
        switchMap(post => {
          return fromPromise(this.getAuthorAlias(post.authorAddress)).pipe(
            switchMap(alias => {
              return of([post, alias] as [PostDto, string]);
            })
          );
        }),
        catchError(() => {
            this.router.navigate(['/read']);
            throw new Error(`Post with hash ${postId} not found`);
        })
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

}

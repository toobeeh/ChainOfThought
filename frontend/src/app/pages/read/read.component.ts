import {Component, Inject} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {author} from "../../service/author.service.interface";
import {BehaviorSubject, firstValueFrom, forkJoin, map, Observable, of, switchMap} from "rxjs";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PostPreviewDto, ContentService as PostsContentService} from "../../../../api";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ButtonComponent} from "../../components/button/button.component";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {Router} from "@angular/router";
import {IAuthorService} from "../../service/author.service.interface";
import {IPostsService, PostFilterType} from "../../service/posts.service.interface";

@Component({
  selector: 'app-read',
    imports: [
        TypewriterComponent,
        AsyncPipe,
        NgForOf,
        NgClass,
        NgIf,
        WhenWriterFinishedDirective,
        DatePipe,
        ButtonComponent
    ],
  templateUrl: './read.component.html',
  standalone: true,
  styleUrl: './read.component.css'
})
export class ReadComponent {

  protected author$: Observable<author>;
  protected readonly filters: {name: string, filter: PostFilterType}[] = [
    {name: "all", filter: PostFilterType.All},
    {name: "favorite", filter: PostFilterType.Favorite},
    {name: "shared", filter: PostFilterType.Own},
    {name: "read", filter: PostFilterType.Read}
  ];

  protected filter$ = new BehaviorSubject<PostFilterType>(PostFilterType.All);

  protected previews$: Observable<{posts: PostPreviewDto[], aliases: Map<string, string>}> = this.filter$.pipe(
      switchMap(filter => this.postsService.getPublishedPostHashes(filter)),
      switchMap(hashes => this.getPostPreviews(hashes)),
      switchMap(previews => {

          if(previews.length === 0) {
              return of({ posts: [], aliases: new Map<string, string>()});
          }

          const authors = previews
              .map(preview => preview.authorAddress)
              .filter((value, index, self) => self.indexOf(value) === index);

          return forkJoin(
              authors.map(address => fromPromise(this.getAuthorAlias(address)).pipe(map(alias => ({alias, address}))))
          ).pipe(
              map(aliases => {
                  const ali = new Map<string, string>();
                  aliases.forEach(a => ali.set(a.address, a.alias));
                  return ali;
              }),
              map(aliases => ({
                  posts: previews, aliases
              }))
          );
      })
  );

  constructor(
      @Inject(IAuthorService) private authorService: IAuthorService,
      @Inject(IPostsService) private postsService: IPostsService,
      @Inject(PostsContentService) private postsContentService: PostsContentService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
  }

  public getPostPreviews(hashes: string[]): Observable<PostPreviewDto[]> {
    if (hashes.length === 0) {
      return of([]);
    }
    return this.postsContentService.findPostPreviews({hashes}).pipe(
        map(posts => posts.sort((a, b) => b.timestamp - a.timestamp))
    );
  }

  public getAuthorAlias(address: string): Promise<string> {
    return this.postsService.getAuthorAlias(address);
  }

    public async goToPost(hash: string, unlock: boolean = false) {
        if(unlock) {
            const author = await firstValueFrom(this.authorService.author$);
            if(author.balance < author.accessPrice) {
                alert(`Your balance (${author.balance} tokens) is not enough to unlock this thought (${author.accessPrice}).`);
                return;
            }

            await this.postsService.unlockPost(hash);
        }
        await this.router.navigate(["/read", hash]);
    }

}

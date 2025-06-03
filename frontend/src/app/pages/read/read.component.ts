import {Component, Inject} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {author, AuthorService} from "../../service/author.service";
import {BehaviorSubject, forkJoin, map, Observable, of, Subject, switchMap, tap} from "rxjs";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {PostFilterType, PostsService} from "../../service/posts.service";
import {PostPreviewDto, PostsService as PostsContentService} from "../../../../api";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ButtonComponent} from "../../components/button/button.component";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {Router} from "@angular/router";

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
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(PostsService) private postsService: PostsService,
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
        if(unlock) await this.postsService.unlockPost(hash);
        await this.router.navigate(["/read", hash]);
    }

}

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {PostDto, PostPreviewDto, PostsService as PostsContentService} from "../../../../api";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {
    BehaviorSubject,
    catchError,
    firstValueFrom,
    map,
    Observable,
    of,
    Subscription,
    switchMap,
    withLatestFrom
} from "rxjs";
import {AsyncPipe, DatePipe, NgForOf, NgIf} from "@angular/common";
import {PostsService} from "../../service/posts.service";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ButtonComponent} from "../../components/button/button.component";
import {author, AuthorService} from "../../service/author.service";
import {PostStatsStruct} from "../../../../types/ethers-contracts/ChainOfThought";

type postData =  {
    post?: { post: PostDto, ps?: PostPreviewDto[], psTo?: PostPreviewDto, stats: PostStatsStruct },
    alias: string,
    preview?: PostPreviewDto
};

@Component({
    selector: 'app-post',
    imports: [
        TypewriterComponent,
        AsyncPipe,
        NgIf,
        WhenWriterFinishedDirective,
        DatePipe,
        ButtonComponent,
        NgForOf,
        RouterLink
    ],
    templateUrl: './post.component.html',
    standalone: true,
    styleUrl: './post.component.css'
})
export class PostComponent implements OnInit, OnDestroy {

    protected data$?: Observable<postData>;
    protected author$?: Observable<author>;
    private paramSubscription?: Subscription;

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

        this.paramSubscription = this.route.paramMap.subscribe(param => {
            const postId = param.get('postHash');
            if(postId === null) {
                this.router.navigate(['/read']);
                return;
            }

            this.data$ = this.postsContentService.getPostByHash(postId).pipe(
                switchMap(post => {
                    return fromPromise(this.postsService.getPostStats(postId)).pipe(
                        map(stats => ({post: {post, stats}, preview: undefined}))
                    );
                }),
                catchError(() => this.postsContentService.findPostPreviews({hashes: [postId]}).pipe(
                        map(posts => ({preview: posts[0], post: undefined}))
                    )
                ),
                switchMap(data => {
                    return fromPromise(this.getAuthorAlias((data.post?.post ?? data.preview)?.authorAddress ?? "")).pipe(
                        switchMap(alias => {
                            return of({...data, alias} as postData);
                        })
                    );
                }),
                switchMap((data: postData) => {
                    if(data.post) {
                        const ps = this.postsContentService.findPostPreviews({hashes: data.post.stats.references.map(ref => ref.toString())});
                        const psTo = this.postsContentService.findPostPreviews({hashes: [data.post.stats.referencedPostHash.toString()]});

                        return ps.pipe(
                            withLatestFrom(psTo),
                            map(([ps, psTo]) => ({
                                ...data,
                                post: {
                                    ...data.post,
                                    ps,
                                    psTo: psTo[0]
                                }
                            } as postData))
                        );
                    }

                    return of(data);
                })
            );
        });
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

    async unlockPost(postHash: string) {
        await this.postsService.unlockPost(postHash);
        this.ngOnInit();
    }

    async writePs(postHash: string){
        await this.router.navigate(['/write'], {
            queryParams: {
                ps: postHash
            }
        });
    }

    ngOnDestroy(): void {
        this.paramSubscription?.unsubscribe();

    }
}

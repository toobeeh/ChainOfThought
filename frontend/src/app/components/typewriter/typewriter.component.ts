import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  BehaviorSubject,
  concatMap,
  delay, filter,
  map, Observable,
  of,
  startWith, Subject,
  Subscription,
  switchMap,
  take,
  tap
} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {TypewriterService} from "../../service/typewriter.service";

@Component({
  selector: 'app-typewriter',
  imports: [
    NgIf,
    AsyncPipe
  ],
  templateUrl: './typewriter.component.html',
  standalone: true,
  styleUrl: './typewriter.component.css'
})
export class TypewriterComponent implements OnInit, OnDestroy {

  public currentContent$ = new BehaviorSubject<{ word: string, index: number, active: boolean } | undefined>(undefined);
  public cursorVisible$ = new BehaviorSubject(false);
  private contentSubscription?: Subscription;
  private finishedSubscription?: Subscription;
  private activatorSubscription?: Subscription;

  private queue$ = new Subject<{ word: string, activator: Observable<unknown> }>();

  /**
   * This needs to be set as the last parameter in the template in order to recognize waitforwriter
   * @param value
   */
  @Input() set content(word: string){

    // delay writing by waiting for other writer and applying initial delay
    const activator = of(true).pipe(
        concatMap((content) => {
          let wait$: Observable<unknown>;
          if (this.waitForWriter !== undefined) {
            wait$ = this.typewriterService.finishedWriters$.pipe(
                filter((key) => key === this.waitForWriter),
                take(1)
            );
          } else {
            wait$ = of(null);
          }

          return wait$.pipe(
              switchMap(() => of(content).pipe(delay(this.initialDelay)))
          );
        })
    );

    this.queue$.next({ word, activator });
  }

  @Input() characterDelay = 100;
  @Input() initialDelay = 0;
  @Input() cursorTimeout: number | undefined = undefined;
  @Input() writerKey: string | undefined = undefined;
  @Input() waitForWriter: string | undefined = undefined;

  @Output() hasContent = new EventEmitter<boolean>();

  constructor(
      @Inject(TypewriterService) private typewriterService: TypewriterService
  ) {
    this.activatorSubscription = this.queue$.pipe(
        tap(({word}) => this.currentContent$.next({ word, index: 0, active: false })),

        /* cancels activation when a new one comes in */
        switchMap(({ word, activator }) => activator.pipe(
            map(() => ({ word, index: 0, active: true })))
        )
    ).subscribe(
        content => this.currentContent$.next(content) /* set activated on content */
    );
  }

  ngOnDestroy(): void {
    this.contentSubscription?.unsubscribe();
    this.finishedSubscription?.unsubscribe();
    this.activatorSubscription?.unsubscribe();
  }

  ngOnInit(): void {

    // start recursively incrementing the index of the current content
    this.contentSubscription = this.currentContent$.pipe(
        switchMap(content => {
          return of(content).pipe(delay(this.characterDelay))
        }),
        tap(content => this.hasContent.next(content?.active === true)),
        filter(content => content !== undefined && content.active)
    ).subscribe((content) => {
      if(content !== undefined && content.index < content.word.length) {
        this.cursorVisible$.next(true);
        this.currentContent$.next({...content, index: content.index + 1});
      }
    });

    // perform actions when writing finished detected
    this.finishedSubscription = this.currentContent$.pipe(
        filter((content) => content !== undefined && content.index >= content.word.length),
        tap(() => {
          if(this.writerKey) this.typewriterService.writerHasFinished(this.writerKey);
        }),
        filter(() => this.cursorTimeout !== undefined),
        delay(this.cursorTimeout ?? 0)
    ).subscribe(() => {
      this.cursorVisible$.next(false);
    })
  }
}

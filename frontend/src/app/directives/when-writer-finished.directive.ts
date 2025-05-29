import {Directive, Inject, Input, OnDestroy, OnInit, Renderer2, TemplateRef, ViewContainerRef} from '@angular/core';
import {TypewriterService} from "../service/typewriter.service";
import {filter, Subscription} from "rxjs";

@Directive({
  standalone: true,
  selector: '[appWhenWriterFinished]'
})
export class WhenWriterFinishedDirective implements OnDestroy {
  @Input() set appWhenWriterFinished(key: string) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.container.clear();

    const viewRef = this.container.createEmbeddedView(this.templateRef);
    const element = (viewRef.rootNodes[0] as HTMLElement);
    if(element) {
      this.renderer.setStyle(element, 'opacity', '0');
      this.renderer.setStyle(element, 'transition', 'opacity 0.5s ease');
    }

    this.subscription = this.typewriterService.finishedWriters$
        .pipe(filter(finishedWriter => finishedWriter === key))
        .subscribe(() => {

          if (element) {
            requestAnimationFrame(() => {
              this.renderer.setStyle(element, 'opacity', '1');
            });
          }
        });
  }

  private subscription?: Subscription;

  constructor(
      private templateRef: TemplateRef<any>,
      private container: ViewContainerRef,
      @Inject(TypewriterService) private typewriterService: TypewriterService,
      private renderer: Renderer2
  ) {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.container.clear();
  }

}

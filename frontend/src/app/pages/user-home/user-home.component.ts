import {Component, Inject} from '@angular/core';
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {author, AuthorService} from "../../service/author.service";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {RouterLink} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-user-home',
    imports: [
        TypewriterComponent,
        AsyncPipe,
        ButtonComponent,
        WhenWriterFinishedDirective,
        RouterLink,
        NgIf
    ],
  templateUrl: './user-home.component.html',
  standalone: true,
  styleUrl: './user-home.component.css'
})
export class UserHomeComponent {

    author$: Observable<author>;

  constructor(
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(AuthorService) private authorService: AuthorService
  ) {
      this.authorService.loadAuthor();
      this.author$ = this.authorService.author$;
  }

}

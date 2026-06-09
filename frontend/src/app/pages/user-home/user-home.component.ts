import {Component, Inject} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe, NgIf} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {RouterLink} from "@angular/router";
import {Observable} from "rxjs";
import {author, IAuthorService} from "../../service/author.service.interface";

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
      @Inject(IAuthorService) private authorService: IAuthorService
  ) {
      this.author$ = this.authorService.author$;
  }

}

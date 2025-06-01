import {Component, Inject} from '@angular/core';
import {author, AuthorService} from "../../service/author.service";
import {Observable} from "rxjs";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {AsyncPipe} from "@angular/common";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {Router} from "@angular/router";

@Component({
  selector: 'app-alias',
  imports: [
    TypewriterComponent,
    AsyncPipe,
    ButtonComponent,
    WhenWriterFinishedDirective
  ],
  templateUrl: './alias.component.html',
  standalone: true,
  styleUrl: './alias.component.css'
})
export class AliasComponent {

  author$: Observable<author>;

  constructor(
      @Inject(AuthorService) private authorService: AuthorService,
      @Inject(Router) private router: Router
  ) {
    this.author$ = this.authorService.author$;
  }

  public async rename(newAlias: string) {
    if(newAlias.length < 1 || newAlias.length > 20) {
      alert("Alias must be between 1 and 20 characters.");
      return;
    }

    try {
      await this.authorService.renameAuthor(newAlias);
      alert("Alias changed successfully!");
      await this.router.navigate(["/home"]);
    }
    catch (e) {
      alert((e as any).reason);
    }
  }
}

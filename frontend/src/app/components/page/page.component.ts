import {Component, Inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {filter, map, Observable} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {LinkComponent} from "../link/link.component";
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {IAuthService} from "../../service/auth.service.interface";
import {IAuthorService} from "../../service/author.service.interface";

@Component({
  selector: 'app-page',
  imports: [
    AsyncPipe,
    LinkComponent,
    NgIf,
    RouterLink
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.css'
})
export class PageComponent implements OnInit {

  protected showNav$?: Observable<boolean>;

  constructor(
      @Inject(Router) private router: Router,
      @Inject(IAuthService) private authService: IAuthService,
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(IAuthorService) private authorService: IAuthorService
  ) {
  }

  ngOnInit(): void {
    this.showNav$ = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => {
          return event.url !== "/";
        }),
    );
  }

  exit(){
    this.authService.reset();
    this.chainOfThoughtService.reset(); // TODO hide behind interface?
    this.authorService.ensureDestroyed();
    this.router.navigate(['/']);
  }

}

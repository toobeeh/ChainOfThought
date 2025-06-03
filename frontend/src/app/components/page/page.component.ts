import {Component, Inject, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {filter, map, Observable} from "rxjs";
import {AsyncPipe, NgIf} from "@angular/common";
import {LinkComponent} from "../link/link.component";
import {Web3Service} from "../../service/web3.service";
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {AuthorService} from "../../service/author.service";

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
      @Inject(Web3Service) private web3Service: Web3Service,
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(AuthorService) private authorService: AuthorService
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
    this.web3Service.reset();
    this.chainOfThoughtService.reset();
    this.authorService.ensureDestroyed();
    this.router.navigate(['/']);
  }

}

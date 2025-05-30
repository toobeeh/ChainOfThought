import {Component, Inject, inject, OnInit} from '@angular/core';
import {ButtonComponent} from "../button/button.component";
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
import {BehaviorSubject, filter, map, Observable, tap} from "rxjs";
import {AsyncPipe, NgClass, NgIf} from "@angular/common";
import * as console from "console";
import {LinkComponent} from "../link/link.component";
import {Web3Service} from "../../service/web3.service";

@Component({
  selector: 'app-page',
  imports: [
    ButtonComponent,
    NgClass,
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
    this.router.navigate(['/']);
  }

}

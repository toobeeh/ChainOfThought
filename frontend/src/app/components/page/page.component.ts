import {Component, Inject, inject, OnInit} from '@angular/core';
import {ButtonComponent} from "../button/button.component";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {BehaviorSubject, filter, map, Observable, tap} from "rxjs";
import {AsyncPipe, NgClass} from "@angular/common";
import * as console from "console";

@Component({
  selector: 'app-page',
  imports: [
    ButtonComponent,
    NgClass,
    AsyncPipe
  ],
  templateUrl: './page.component.html',
  standalone: true,
  styleUrl: './page.component.css'
})
export class PageComponent implements OnInit {

  protected showNav$?: Observable<boolean>;

  constructor(@Inject(Router) private router: Router) {
  }

  ngOnInit(): void {
    this.showNav$ = this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd) => {
          return event.url !== "/";
        }),
    );
  }

}

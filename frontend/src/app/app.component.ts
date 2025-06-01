import {Component, Inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TypewriterComponent} from "./components/typewriter/typewriter.component";
import {ButtonComponent} from "./components/button/button.component";
import {PageComponent} from "./components/page/page.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PageComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {

}

import { Component } from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";

@Component({
  selector: 'app-about',
  imports: [
    TypewriterComponent
  ],
  templateUrl: './about.component.html',
  standalone: true,
  styleUrl: './about.component.css'
})
export class AboutComponent {

}

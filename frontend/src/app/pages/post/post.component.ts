import { Component } from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";

@Component({
  selector: 'app-post',
  imports: [
    TypewriterComponent
  ],
  templateUrl: './post.component.html',
  standalone: true,
  styleUrl: './post.component.css'
})
export class PostComponent {

}

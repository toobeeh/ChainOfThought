import {Component, Input} from '@angular/core';
import {TypewriterComponent} from "../typewriter/typewriter.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-link',
  imports: [
    TypewriterComponent,
    NgClass
  ],
  templateUrl: './link.component.html',
  standalone: true,
  styleUrl: './link.component.css'
})
export class LinkComponent {

  @Input() content: string = '';
  @Input() waitForWriter: string | undefined;

  hasContent = false;
}

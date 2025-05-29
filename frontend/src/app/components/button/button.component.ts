import {Component, Input} from '@angular/core';
import {TypewriterComponent} from "../typewriter/typewriter.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-button',
  imports: [
    TypewriterComponent,
    NgClass
  ],
  templateUrl: './button.component.html',
  standalone: true,
  styleUrl: './button.component.css'
})
export class ButtonComponent {

  @Input() content: string = '';
  @Input() waitForWriter: string | undefined;

  hasContent = false;

}

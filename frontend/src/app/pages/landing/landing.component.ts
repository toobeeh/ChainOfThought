import {Component, Inject} from '@angular/core';
import {Web3Service} from "../../service/web3.service";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-landing',
  imports: [TypewriterComponent, ButtonComponent],
  templateUrl: './landing.component.html',
  standalone: true,
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  hero = "chain of thought";
  captions = [
    "a little poem might save (your) day :)",
    "stop deromantization of procrastination!",
    "take your time, write off your mind",
  ];
  caption = this.selectRandomCaption();

  constructor(
      @Inject(Web3Service) private web3Service: Web3Service,
      @Inject(Router) private router: Router
  ) {  }

  selectRandomCaption(): string {
    const randomIndex = Math.floor(Math.random() * this.captions.length);
    return this.captions[randomIndex];
  }

  async authenticate() {
    await this.web3Service.authenticate();
    await this.router.navigate(['/home']);
  }
}

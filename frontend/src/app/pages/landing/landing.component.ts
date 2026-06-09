import {Component, Inject} from '@angular/core';
import {Web3Service} from "../../service/onchain/web3.service";
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {Router} from "@angular/router";
import {IAuthService} from "../../service/auth.service.interface";
import {environment} from "../../../environments/environment";
import {BackendSelectorService} from "../../service/backend-selector.service";

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
    "poems don't always have to rhyme. they're just supposed to be creative.\n  (~ moonrise kingdom)",
    "preserve creativity at all cost!",
    "dear diary, you won't believe what happened today:",
    "mansplain your world to me!"
  ];
  caption = this.selectRandomCaption();

  constructor(
      @Inject(IAuthService) private authService: IAuthService,
      @Inject(BackendSelectorService) private backendSelectorService: BackendSelectorService,
      @Inject(Router) private router: Router
  ) {  }

  selectRandomCaption(): string {
    const randomIndex = Math.floor(Math.random() * this.captions.length);
    return this.captions[randomIndex];
  }

  isBlockchainEnabled() {
    return this.backendSelectorService.selectedBackend === "onchain";
  }

  toggleBackend() {
    if(this.backendSelectorService.selectedBackend === "onchain") {
      this.backendSelectorService.selectOffchain();
    }
    else {
      this.backendSelectorService.selectOnchain();
    }
  }

  async authenticate() {
    await this.authService.authenticate();
    await this.router.navigate(['/home']);
  }
}

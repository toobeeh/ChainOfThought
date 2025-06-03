import {Component, Inject} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {map, Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {Router} from "@angular/router";
import {AuthorService} from "../../service/author.service";
import {formatEther} from "ethers";

@Component({
  selector: 'app-buy',
  imports: [
    TypewriterComponent,
    ButtonComponent,
    WhenWriterFinishedDirective,
    AsyncPipe
  ],
  templateUrl: './buy.component.html',
  standalone: true,
  styleUrl: './buy.component.css'
})
export class BuyComponent {

  protected price$: Observable<string>;

  constructor(
      @Inject(Router) private router: Router,
      @Inject(AuthorService) private authorService: AuthorService
  ) {
    this.price$ = this.authorService.author$.pipe(
        map(author => `${formatEther(author.tokenPrice)} ETH`)
    );
  }

  async buy(amount: string){
    const parsedAmount = Number(amount);
    if(isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await this.authorService.buyTokens(parsedAmount);
      alert("Tokens purchased successfully!");
      await this.router.navigate(['/home']);
    }
    catch {
      alert("An error occurred while purchasing tokens. Please try again.");
    }
  }
}

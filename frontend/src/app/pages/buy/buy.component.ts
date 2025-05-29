import {Component, Inject} from '@angular/core';
import {TypewriterComponent} from "../../components/typewriter/typewriter.component";
import {ButtonComponent} from "../../components/button/button.component";
import {WhenWriterFinishedDirective} from "../../directives/when-writer-finished.directive";
import {ChainOfThoughtService} from "../../service/chain-of-thought.service";
import {map, Observable, switchMap} from "rxjs";
import {fromPromise} from "rxjs/internal/observable/innerFrom";
import {AsyncPipe} from "@angular/common";
import {ethers, toBigInt} from "ethers";
import {Router} from "@angular/router";

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

  tokenCost$: Observable<string>;

  constructor(
      @Inject(ChainOfThoughtService) private chainOfThoughtService: ChainOfThoughtService,
      @Inject(Router) private router: Router
  ) {
    this.tokenCost$ = fromPromise(this.chainOfThoughtService.getContract()).pipe(
      switchMap(contract => contract.getTokenValue()),
      map(value => ethers.formatEther(value)+ " ETH")
    );
  }

  async buy(amount: string){
    const parsedAmount = Number(amount);
    if(isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const cost = await (await this.chainOfThoughtService.getContract()).getTokenValue() * toBigInt(parsedAmount);
    (await this.chainOfThoughtService.getContract()).buyTokens({value: cost})
      .then(() => {
        alert("Tokens purchased successfully!");
        this.router.navigate(["/home"]);
      })
      .catch((error) => {
        console.error("Error purchasing tokens:", error);
        alert("An error occurred while purchasing tokens. Please try again.");
      });
  }

}

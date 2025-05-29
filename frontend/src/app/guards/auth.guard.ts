import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {Web3Service} from "../service/web3.service";

export const authGuard: CanActivateFn = async (route, state) => {
  const web3Service = inject(Web3Service);
  const router = inject(Router);
  const authenticated = await web3Service.isAuthenticated();
  return authenticated ? true : router.createUrlTree(["/"]);
};

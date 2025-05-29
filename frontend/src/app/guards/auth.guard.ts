import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {Web3Service} from "../service/web3.service";

export const authGuard: CanActivateFn = (route, state) => {
  const web3Service = inject(Web3Service);
  const router = inject(Router);
  return web3Service.isAuthenticated ? true : router.createUrlTree(["/"]);
};

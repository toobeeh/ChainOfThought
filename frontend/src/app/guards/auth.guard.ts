import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {Web3Service} from "../service/web3.service";
import {AuthorService} from "../service/author.service";

export const authGuard: CanActivateFn = async (route, state) => {
  const web3Service = inject(Web3Service);
  const authorService = inject(AuthorService);
  const router = inject(Router);
  const authenticated = await web3Service.isAuthenticated();

  if(authenticated) await authorService.ensureInitialized();
  else await authorService.ensureDestroyed();

  return authenticated ? true : router.createUrlTree(["/"]);
};

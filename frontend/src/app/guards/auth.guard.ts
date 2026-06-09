import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {IAuthService} from "../service/auth.service.interface";
import {IAuthorService} from "../service/author.service.interface";

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject<IAuthService>(IAuthService);
  const authorService = inject<IAuthorService>(IAuthorService);
  const router = inject(Router);
  const authenticated = await authService.isAuthenticated();

  if(authenticated) await authorService.ensureInitialized();
  else await authorService.ensureDestroyed();

  return authenticated ? true : router.createUrlTree(["/"]);
};

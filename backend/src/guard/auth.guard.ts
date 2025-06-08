import {CanActivate, ExecutionContext, Inject, Injectable, Scope} from '@nestjs/common';
import {Observable} from 'rxjs';
import {IAuthService} from "../service/auth.service.interface";

@Injectable({scope: Scope.REQUEST})
export class AuthGuard implements CanActivate {

    constructor(@Inject(IAuthService) private readonly authService: IAuthService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.authService.attachIdentity(request);
    }
}
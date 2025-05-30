import {CanActivate, ExecutionContext, Injectable, Scope} from '@nestjs/common';
import {Observable} from 'rxjs';
import {AuthService} from "../service/auth.service";

@Injectable({scope: Scope.REQUEST})
export class AuthGuard implements CanActivate {

    constructor(private readonly authService: AuthService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.authService.attachIdentity(request);
    }
}
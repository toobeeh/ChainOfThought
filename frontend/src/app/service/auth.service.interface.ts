import {InjectionToken} from "@angular/core";

export const IAuthService = new InjectionToken("IAuthService");

export interface IAuthService {
    getCurrentToken(): string | undefined;
    authenticate(): Promise<void>;
    isAuthenticated(): Promise<boolean>;
    getAddress(): Promise<string | undefined>;
    reset(): void;
}
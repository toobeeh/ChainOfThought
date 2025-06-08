export const IAuthService = Symbol("IAuthService");

/**
 * Service to handle the authenticated user, must be request scoped
 */
export interface IAuthService {

    /**
     * Returns the authenticated address of the user.
     * Throws a ForbiddenException if no address is authenticated.
     */
    readonly authenticatedAddress: string;


    /**
     * Attaches the authenticated identity to the request.
     * @param request
     */
    attachIdentity(request: any): boolean;
}
import {ethers} from "ethers";
import {Request} from "express";

interface AuthTokenPayload {
    message: string;
    signature: string;
}

/**
 * Extracts and validates the authenticated address from the request's authorization header
 * @param request
 * @returns The authenticated address if valid, otherwise undefined
 */
export function getAuthenticatedAddress(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    const authRegex = /^Bearer\s+([a-zA-Z0-9]+)$/;

    // Check if the authorization header is present and matches the expected format
    if (typeof authHeader === 'string') {
        const match = authHeader.match(authRegex);
        if (match && match[1]) {

            // Attempt to parse and verify the auth token
            try {
                return parseAndVerifyAuthToken(match[1]);
            }
            catch (error) {
                console.error('Failed to parse or verify auth token:', error);
            }
        }
    }

    // If the authorization header is missing or invalid, return undefined
    return undefined;
}

/**
 * Parses the auth token and verifies the signature
 * @param token The base64 encoded auth token payload
 * @returns The authenticated address
 */
function parseAndVerifyAuthToken(token: string): string {
    const json = Buffer.from(token, 'base64').toString('utf-8');
    const parsed: AuthTokenPayload = JSON.parse(json);

    return ethers.verifyMessage(parsed.message, parsed.signature);
}
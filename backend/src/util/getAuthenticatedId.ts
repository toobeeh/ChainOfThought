import {Request} from "express";
import * as nacl from "tweetnacl";

interface AuthTokenPayload {
    message: string;
    publicKey: string;
    signature: string;
}

/**
 * Extracts and validates the authenticated public key as id from the request's authorization header
 * @param request
 * @returns The authenticated public key if valid, otherwise undefined
 */
export function getAuthenticatedId(request: Request): string | undefined {
    const authHeader = request.headers["authorization"];
    const authRegex = /^Bearer\s+([a-zA-Z0-9=]+)$/;

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
 * @returns The public key as id
 */
function parseAndVerifyAuthToken(token: string): string {

    const json = Buffer.from(token, "base64").toString("utf8");
    const parsed: AuthTokenPayload = JSON.parse(json);

    const valid = nacl.sign.detached.verify(
        new TextEncoder().encode(parsed.message),
        Buffer.from(parsed.signature, "hex"),
        Buffer.from(parsed.publicKey, "hex")
    );

    if (!valid) {
        throw new Error("Invalid signature");
    }

    return parsed.publicKey;
}
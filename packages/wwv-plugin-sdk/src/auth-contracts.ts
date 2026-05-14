/**
 * @file auth-contracts.ts
 * @description Shared contracts for Decentralized Plugin Authentication.
 */

/**
 * A branded string type for sensitive credentials to prevent accidental logging or serialization.
 */
export type SensitiveString = string & { readonly __brand: "SensitiveString" };

/**
 * The authorization tier of the plugin client.
 */
export type Tier = "basic" | "pro";

/**
 * Payload sent by the Local App to the Marketplace to exchange a long-lived
 * API key for a short-lived, audience-bound JWT.
 * 
 * @see ADR-001 §2 "Asymmetric JWT Token Exchange"
 */
export interface TokenExchangeRequest {
    /** 
     * The long-lived API key securely stored by the Local App 
     * @security Sensitive credential — must not be logged.
     */
    apiKey: SensitiveString;
    /** The specific Data Engine (audience) the Local App wants to connect to */
    audience: string;
}

/**
 * Payload returned by the Marketplace after a successful token exchange.
 * 
 * @see ADR-001 §2 "Asymmetric JWT Token Exchange"
 */
export interface TokenExchangeResponse {
    /** The JWT to attach to the WebSocket auth message */
    token: SensitiveString;
    /** Unix timestamp (ms) indicating when the token expires — so the Local App can refresh pre-emptively */
    expiresAt: number;
    /** Key id used to sign — useful when JWKS has multiple keys during rotation */
    kid: string;
    /** The entitlement tier of the client */
    tier?: Tier;
}

/**
 * First message sent by the Local App over the WebSocket to authenticate with the Data Engine.
 * 
 * @see ADR-001 §4 "WebSocket Authentication Gating"
 */
export interface WebSocketAuthMessage {
    type: "auth";
    /** Protocol version to allow future wire shape evolution */
    v: 1;
    /** The short-lived JWT obtained from the Token Exchange */
    token: SensitiveString;
}

/**
 * Standard PKCE request shape during the initial connect flow.
 */
export interface PKCEConnectRequest {
    /** Randomly generated state to prevent CSRF */
    state: string;
    /** The S256 hash of the code verifier */
    code_challenge: string;
    /** The challenge method (always "S256" for our implementation) */
    code_challenge_method: "S256";
}

/**
 * Standard PKCE exchange payload.
 */
export interface PKCETokenExchange {
    /** The authorization code received from the callback */
    code: string;
    /** The original unhashed verifier to prove possession */
    code_verifier: string;
}

/**
 * The expected structure of the JWT claims after signature verification.
 */
export interface PluginJwtClaims {
    /** Issuer (Marketplace URL) */
    iss: string;
    /** Subject (The plugin identifier or tenant ID) */
    sub: string;
    /** Audience (The specific Data Engine URL or ID) */
    aud: string;
    /** Expiration Time (Unix seconds) */
    exp: number;
    /** Not Before (Unix seconds) */
    nbf: number;
    /** Issued At (Unix seconds) */
    iat: number;
    /** JWT ID (Unique identifier for the token to prevent replay) */
    jti: string;
    /** The entitlement tier */
    tier: Tier;
    /** Optional array of allowed plugin namespace prefixes */
    plugins?: string[];
}

/**
 * Standard error response shape for the auth API.
 */
export interface AuthErrorResponse {
    /** Short error code (e.g., "invalid_grant", "rate_limit_exceeded") */
    error: string;
    /** Human-readable error description */
    error_description: string;
}

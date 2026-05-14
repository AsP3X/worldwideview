import { describe, it, expectTypeOf } from "vitest";
import type { 
    TokenExchangeRequest, 
    TokenExchangeResponse, 
    WebSocketAuthMessage,
    SensitiveString,
    Tier
} from "./auth-contracts";

describe("Auth Contracts", () => {
    it("TokenExchangeRequest has exact required properties", () => {
        expectTypeOf<TokenExchangeRequest>().toHaveProperty("apiKey").toEqualTypeOf<SensitiveString>();
        expectTypeOf<TokenExchangeRequest>().toHaveProperty("audience").toEqualTypeOf<string>();

        // @ts-expect-error - missing required apiKey
        const badReq: TokenExchangeRequest = { audience: "engine-123" };
    });

    it("TokenExchangeResponse has exact required properties", () => {
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("token").toEqualTypeOf<SensitiveString>();
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("expiresAt").toEqualTypeOf<number>();
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("kid").toEqualTypeOf<string>();
        // tier is optional
        expectTypeOf<TokenExchangeResponse>().toHaveProperty("tier").toEqualTypeOf<Tier | undefined>();

        // @ts-expect-error - missing required token
        const badRes: TokenExchangeResponse = { expiresAt: 123456789, kid: "key-1" };
    });

    it("WebSocketAuthMessage has exact required properties including protocol version", () => {
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("type").toEqualTypeOf<"auth">();
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("v").toEqualTypeOf<1>();
        expectTypeOf<WebSocketAuthMessage>().toHaveProperty("token").toEqualTypeOf<SensitiveString>();

        // @ts-expect-error - missing version
        const badMsg: WebSocketAuthMessage = { type: "auth", token: "jwt-token-here" as SensitiveString };
        
        // @ts-expect-error - wrong version
        const badVersion: WebSocketAuthMessage = { type: "auth", v: 2, token: "jwt-token-here" as SensitiveString };
    });
});

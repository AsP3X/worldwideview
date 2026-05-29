import {
    describe, it, expect, vi, beforeEach
} from "vitest";
import { generateApiKey, authenticateApiKey } from "./apiKeyAuth";
import { prisma } from "@/lib/db";

vi.mock("@/lib/db", () => ({
    prisma: {
        userApiKey: {
            findUnique: vi.fn(),
            create: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            deleteMany: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock("@/core/edition", () => ({
    isDemo: false,
}));

// ---------------------------------------------------------------------------
// generateApiKey — KEY-01
// ---------------------------------------------------------------------------

describe("generateApiKey", () => {
    it("returns an object with prefix, secret, hashedSecret, fullToken", async () => {
        const key = await generateApiKey();
        expect(key).toHaveProperty("prefix");
        expect(key).toHaveProperty("secret");
        expect(key).toHaveProperty("hashedSecret");
        expect(key).toHaveProperty("fullToken");
    });

    it("prefix starts with 'wwv_'", async () => {
        const key = await generateApiKey();
        expect(key.prefix).toMatch(/^wwv_/);
    });

    it("fullToken equals prefix.secret", async () => {
        const key = await generateApiKey();
        expect(key.fullToken).toBe(`${key.prefix}.${key.secret}`);
    });

    it("secret is not equal to hashedSecret (secret is plaintext, hashedSecret is bcrypt)", async () => {
        const key = await generateApiKey();
        expect(key.secret).not.toBe(key.hashedSecret);
    });
});

// ---------------------------------------------------------------------------
// authenticateApiKey — KEY-02, API-01
// ---------------------------------------------------------------------------

describe("authenticateApiKey", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("returns null when Authorization header is missing", async () => {
        const req = new Request("http://localhost/api/test");
        const result = await authenticateApiKey(req);
        expect(result).toBeNull();
    });

    it("returns null when Authorization header is not Bearer", async () => {
        const req = new Request("http://localhost/api/test", {
            headers: { authorization: "Basic abc123" },
        });
        const result = await authenticateApiKey(req);
        expect(result).toBeNull();
    });

    it("returns null when token has no '.' separator", async () => {
        const req = new Request("http://localhost/api/test", {
            headers: { authorization: "Bearer wwv_XXXXXXXX" },
        });
        const result = await authenticateApiKey(req);
        expect(result).toBeNull();
    });

    it("returns null on unknown prefix (findUnique -> null) and does NOT throw", async () => {
        vi.mocked(prisma.userApiKey.findUnique).mockResolvedValue(null);
        const req = new Request("http://localhost/api/test", {
            headers: { authorization: "Bearer wwv_XXXXXXXX.fakesecret" },
        });
        await expect(authenticateApiKey(req)).resolves.toBeNull();
    });

    it("returns null on valid prefix but wrong secret (bcrypt mismatch)", async () => {
        vi.mocked(prisma.userApiKey.findUnique).mockResolvedValue({
            id: "key-id-1",
            userId: "user-123",
            hashedSecret: "$2a$12$invalid.hash.that.will.not.match.anything.at.all.XX",
        } as never);
        const req = new Request("http://localhost/api/test", {
            headers: { authorization: "Bearer wwv_XXXXXXXX.wrongsecret" },
        });
        const result = await authenticateApiKey(req);
        expect(result).toBeNull();
    });

    it("returns { userId, keyId } on valid token (API-01)", async () => {
        // Generate a real key so we have a matching prefix + secret pair
        const { prefix, secret, hashedSecret } = await generateApiKey();
        vi.mocked(prisma.userApiKey.findUnique).mockResolvedValue({
            id: "key-id-real",
            userId: "user-real",
            hashedSecret,
        } as never);
        // Suppress the fire-and-forget update call
        vi.mocked(prisma.userApiKey.update).mockResolvedValue({} as never);

        const req = new Request("http://localhost/api/test", {
            headers: { authorization: `Bearer ${prefix}.${secret}` },
        });
        const result = await authenticateApiKey(req);
        expect(result).toEqual({ userId: "user-real", keyId: "key-id-real" });
    });

    // [slow] — bcrypt dummy compare takes ~250ms; excluded from quick-run sub-100ms suite
    it("miss path runs dummy compare — elapsed > 100ms (timing oracle prevention) // [slow]", async () => {
        vi.mocked(prisma.userApiKey.findUnique).mockResolvedValue(null);
        const req = new Request("http://localhost/api/test", {
            headers: { authorization: "Bearer wwv_XXXXXXXX.fakesecret" },
        });
        const start = performance.now();
        const result = await authenticateApiKey(req);
        const elapsed = performance.now() - start;
        expect(result).toBeNull();
        expect(elapsed).toBeGreaterThan(100);
    });
});

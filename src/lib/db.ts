import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Prisma client singleton — PostgreSQL only.
 *
 * Local dev:  Run `npx prisma dev` for a zero-install local Postgres.
 * Production: Set DATABASE_URL to your Supabase/Postgres connection string.
 *
 * Uses globalThis to survive Next.js HMR in development.
 */

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error(
            "[db] DATABASE_URL is not set. " +
            "Run `npx prisma dev` for local development, " +
            "or set DATABASE_URL to your PostgreSQL connection string."
        );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

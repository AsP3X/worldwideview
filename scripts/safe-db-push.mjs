import { execSync } from 'child_process';

const dbUrl = process.env.DATABASE_URL || '';

if (!dbUrl) {
  // eslint-disable-next-line no-console
  console.error("❌ ERROR: DATABASE_URL is missing.");
  // eslint-disable-next-line no-console
  console.error("   Did you forget to run 'pnpm run setup' to generate your .env file?");
  process.exit(1);
}

const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('host.docker.internal') || dbUrl.includes('postgres:postgres@db:5432');

if (!isLocal) {
  // eslint-disable-next-line no-console
  console.error("❌ ERROR: DATABASE_URL points to a remote database.");
  // eslint-disable-next-line no-console
  console.error("   Running 'prisma db push --accept-data-loss' on production/staging data is forbidden.");
  // eslint-disable-next-line no-console
  console.error("   If you truly need to migrate a remote db, run prisma db push manually.");
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log("🔒 Local database detected. Safely running prisma db push...");
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

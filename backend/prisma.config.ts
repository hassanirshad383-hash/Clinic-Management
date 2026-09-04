import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// CLI-only configuration (generate, migrate, studio, seed). The running
// application does NOT read this file — it builds its own driver adapter
// in src/prisma/prisma.service.ts from process.env.DATABASE_URL.
//
// Falls back to POSTGRES_PRISMA_URL / POSTGRES_URL so this works out of the
// box with Vercel's Neon integration, which does not create a plain
// DATABASE_URL variable.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});

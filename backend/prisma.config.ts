import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// CLI-only configuration (generate, migrate, studio, seed). The running
// application does NOT read this file — it builds its own driver adapter
// in src/prisma/prisma.service.ts from process.env.DATABASE_URL.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});

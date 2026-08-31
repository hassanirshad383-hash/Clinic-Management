import type { AdminRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: AdminRole;
}

import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given admin roles. Must be combined with
 * RolesGuard (applied globally in AppModule). Superset roles are NOT
 * implied automatically — list every role that should have access.
 */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);

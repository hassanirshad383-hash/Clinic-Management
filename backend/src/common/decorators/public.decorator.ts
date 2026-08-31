import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as publicly accessible, bypassing the global JwtAuthGuard.
 * Use sparingly — every other route requires a valid access token by default.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Parses simple duration strings like "15m", "7d", "1h", "30s" into a
 * future Date. Supports the same units NestJS JwtModule accepts for
 * expiresIn, kept minimal on purpose.
 */
const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function durationToMs(duration: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration string: ${duration}`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_MS[unit];
}

export function addDuration(from: Date, duration: string): Date {
  return new Date(from.getTime() + durationToMs(duration));
}

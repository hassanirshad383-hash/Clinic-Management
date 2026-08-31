import { createHash, randomBytes } from 'node:crypto';

export function generateRawToken(): string {
  return randomBytes(48).toString('hex');
}

// Refresh tokens are looked up by hash, so a fast, deterministic hash
// (rather than a slow salted hash like argon2) is used — the token itself
// already has 384 bits of entropy, so this is not a password.
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

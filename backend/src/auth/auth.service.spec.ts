import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';

function buildDeps() {
  const prisma = {
    adminUser: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn().mockResolvedValue(undefined),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  };
  const jwtService = { sign: vi.fn().mockReturnValue('signed.jwt.token') };
  const config = {
    getOrThrow: vi.fn().mockReturnValue('test-secret'),
    get: vi.fn().mockReturnValue(undefined),
  };
  const audit = { record: vi.fn().mockResolvedValue(undefined) };

  return { prisma, jwtService, config, audit };
}

describe('AuthService', () => {
  let deps: ReturnType<typeof buildDeps>;
  let service: AuthService;

  beforeEach(() => {
    deps = buildDeps();
    service = new AuthService(
      deps.prisma as never,
      deps.jwtService as never,
      deps.config as never,
      deps.audit as never,
    );
  });

  it('rejects login for an unknown email', async () => {
    deps.prisma.adminUser.findUnique.mockResolvedValue(null);

    await expect(
      service.login('nobody@example.com', 'whatever-password', {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login for a deactivated admin', async () => {
    deps.prisma.adminUser.findUnique.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      isActive: false,
      passwordHash: await argon2.hash('correct-password'),
      role: 'ADMIN',
    });

    await expect(
      service.login('admin@example.com', 'correct-password', {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login with an incorrect password', async () => {
    deps.prisma.adminUser.findUnique.mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      isActive: true,
      passwordHash: await argon2.hash('correct-password'),
      role: 'ADMIN',
    });

    await expect(
      service.login('admin@example.com', 'wrong-password', {}),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('issues an access token and a refresh token on successful login', async () => {
    const passwordHash = await argon2.hash('correct-password');
    deps.prisma.adminUser.findUnique.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      passwordHash,
      lastLoginAt: null,
    });
    deps.prisma.adminUser.update.mockResolvedValue({});

    const result = await service.login('admin@example.com', 'correct-password', {
      ipAddress: '127.0.0.1',
    });

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.admin.email).toBe('admin@example.com');
    expect(result.admin).not.toHaveProperty('passwordHash');
    expect(deps.prisma.refreshToken.create).toHaveBeenCalledOnce();
    expect(deps.audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ADMIN_LOGIN' }),
    );
  });

  it('rejects a refresh with an unknown token', async () => {
    deps.prisma.refreshToken.findUnique.mockResolvedValue(null);

    await expect(service.refresh('not-a-real-token', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a refresh with a revoked token', async () => {
    deps.prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'rt-1',
      revokedAt: new Date(),
      expiresAt: new Date(Date.now() + 100_000),
      adminUser: { isActive: true },
    });

    await expect(service.refresh('revoked-token', {})).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});

import { describe, expect, it, vi } from 'vitest';
import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

function buildContext(user?: { role: string }): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows the request when no roles are required', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext({ role: 'STAFF' }))).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValueOnce(undefined) // isPublic
        .mockReturnValueOnce(['SUPER_ADMIN', 'ADMIN']), // roles
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext({ role: 'ADMIN' }))).toBe(true);
  });

  it('denies a user whose role is not in the required list', () => {
    const reflector = {
      getAllAndOverride: vi
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(['SUPER_ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(buildContext({ role: 'STAFF' }))).toThrow(
      ForbiddenException,
    );
  });

  it('bypasses role checks for public routes', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValueOnce(true), // isPublic
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(buildContext(undefined))).toBe(true);
  });
});

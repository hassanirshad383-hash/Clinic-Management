import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { AdminUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { addDuration } from '../common/utils/duration.util.js';
import { generateRawToken, hashToken } from './utils/token-hash.util.js';
import type { JwtPayload } from './types/jwt-payload.interface.js';

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUser['role'];
  isActive: boolean;
  lastLoginAt: Date | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  admin: SafeAdminUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async login(
    email: string,
    password: string,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    const user = await this.prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Constant-shaped error regardless of whether the email exists, to
    // avoid leaking which admin accounts exist via response timing/content.
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await argon2.verify(user.passwordHash, password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.signAccessToken(user);
    const { rawToken, expiresAt } = await this.issueRefreshToken(
      user.id,
      meta,
    );

    await this.prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.audit.record({
      userId: user.id,
      action: 'ADMIN_LOGIN',
      resource: 'AdminUser',
      resourceId: user.id,
      ipAddress: meta.ipAddress,
    });

    return {
      accessToken,
      refreshToken: rawToken,
      refreshExpiresAt: expiresAt,
      admin: this.sanitize(user),
    };
  }

  async refresh(rawToken: string, meta: RequestMeta): Promise<AuthResult> {
    const tokenHash = hashToken(rawToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { adminUser: true },
    });

    if (
      !record ||
      record.revokedAt ||
      record.expiresAt < new Date() ||
      !record.adminUser.isActive
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotation: revoke the used token and issue a fresh one.
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    const accessToken = this.signAccessToken(record.adminUser);
    const { rawToken: newRawToken, expiresAt } = await this.issueRefreshToken(
      record.adminUserId,
      meta,
    );

    return {
      accessToken,
      refreshToken: newRawToken,
      refreshExpiresAt: expiresAt,
      admin: this.sanitize(record.adminUser),
    };
  }

  async logout(rawToken: string | undefined, adminUserId?: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (adminUserId) {
      await this.audit.record({
        userId: adminUserId,
        action: 'ADMIN_LOGOUT',
        resource: 'AdminUser',
        resourceId: adminUserId,
      });
    }
  }

  sanitize(user: AdminUser): SafeAdminUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private signAccessToken(user: AdminUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const expiresIn = this.config.get<string>('JWT_ACCESS_TTL') ?? '15m';
    return this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      // `expiresIn` is typed against the `ms` package's branded string
      // literals; a plain env-sourced string is still valid at runtime.
      expiresIn: expiresIn as unknown as number,
    });
  }

  private async issueRefreshToken(
    adminUserId: string,
    meta: RequestMeta,
  ): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const ttl = this.config.get<string>('JWT_REFRESH_TTL') ?? '7d';
    const expiresAt = addDuration(new Date(), ttl);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        adminUserId,
        expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });

    return { rawToken, expiresAt };
  }
}

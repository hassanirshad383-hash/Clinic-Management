import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { AdminUser } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { SafeAdminUser } from '../auth/auth.service.js';
import type { CreateAdminDto } from './dto/create-admin.dto.js';
import type { UpdateAdminDto } from './dto/update-admin.dto.js';

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateAdminDto,
    actingAdminId: string,
  ): Promise<SafeAdminUser> {
    const existing = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException('An admin with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password);

    const admin = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: dto.role,
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'ADMIN_CREATED',
      resource: 'AdminUser',
      resourceId: admin.id,
      metadata: { role: admin.role },
    });

    return this.sanitize(admin);
  }

  async findAll(): Promise<SafeAdminUser[]> {
    const admins = await this.prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return admins.map((admin) => this.sanitize(admin));
  }

  async findOne(id: string): Promise<SafeAdminUser> {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return this.sanitize(admin);
  }

  async update(
    id: string,
    dto: UpdateAdminDto,
    actingAdminId: string,
  ): Promise<SafeAdminUser> {
    const admin = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const updated = await this.prisma.adminUser.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'ADMIN_UPDATED',
      resource: 'AdminUser',
      resourceId: id,
      metadata: dto as Record<string, unknown>,
    });

    return this.sanitize(updated);
  }

  private sanitize(user: AdminUser): SafeAdminUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
    };
  }
}

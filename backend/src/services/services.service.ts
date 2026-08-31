import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Service } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import type { Paginated } from '../common/dto/pagination-query.dto.js';
import type { CreateServiceDto } from './dto/create-service.dto.js';
import type { UpdateServiceDto } from './dto/update-service.dto.js';
import type { QueryServiceDto } from './dto/query-service.dto.js';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /** Public catalog — active services only. */
  async findPublic(query: QueryServiceDto): Promise<Paginated<Service>> {
    const { page, limit, category } = query;
    const where = { isActive: true, ...(category ? { category } : {}) };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findPublicBySlug(slug: string): Promise<Service> {
    const service = await this.prisma.service.findFirst({
      where: { slug, isActive: true },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  /** Admin management view — includes inactive services. */
  async findAllForAdmin(query: QueryServiceDto): Promise<Paginated<Service>> {
    const { page, limit, category, isActive } = query;
    const where = {
      ...(category ? { category } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findByIdForAdmin(id: string): Promise<Service> {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  async create(dto: CreateServiceDto, actingAdminId: string): Promise<Service> {
    const existing = await this.prisma.service.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('A service with this slug already exists');
    }

    const service = await this.prisma.service.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        category: dto.category,
        shortDescription: dto.shortDescription,
        description: dto.description,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'SERVICE_CREATED',
      resource: 'Service',
      resourceId: service.id,
    });

    return service;
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
    actingAdminId: string,
  ): Promise<Service> {
    await this.findByIdForAdmin(id);

    if (dto.slug) {
      const existing = await this.prisma.service.findUnique({
        where: { slug: dto.slug },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('A service with this slug already exists');
      }
    }

    const service = await this.prisma.service.update({
      where: { id },
      data: dto,
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'SERVICE_UPDATED',
      resource: 'Service',
      resourceId: id,
      metadata: dto as Record<string, unknown>,
    });

    return service;
  }

  async remove(id: string, actingAdminId: string): Promise<void> {
    await this.findByIdForAdmin(id);
    await this.prisma.service.delete({ where: { id } });

    await this.audit.record({
      userId: actingAdminId,
      action: 'SERVICE_DELETED',
      resource: 'Service',
      resourceId: id,
    });
  }
}

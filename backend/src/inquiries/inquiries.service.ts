import { Injectable, NotFoundException } from '@nestjs/common';
import type { Inquiry } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import type { Paginated } from '../common/dto/pagination-query.dto.js';
import type { CreateInquiryDto } from './dto/create-inquiry.dto.js';
import type { UpdateInquiryDto } from './dto/update-inquiry.dto.js';
import type { QueryInquiryDto } from './dto/query-inquiry.dto.js';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateInquiryDto): Promise<Inquiry> {
    const inquiry = await this.prisma.inquiry.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        message: dto.message,
      },
    });

    await this.notifications.notifyInquiryReceived({
      id: inquiry.id,
      name: inquiry.name,
    });

    return inquiry;
  }

  async findAll(query: QueryInquiryDto): Promise<Paginated<Inquiry>> {
    const { page, limit, status, date } = query;

    const where = {
      ...(status ? { status } : {}),
      ...(date
        ? {
            createdAt: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T23:59:59.999Z`),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: string): Promise<Inquiry> {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    return inquiry;
  }

  async update(
    id: string,
    dto: UpdateInquiryDto,
    actingAdminId: string,
  ): Promise<Inquiry> {
    await this.findOne(id);

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: dto.status !== undefined ? { status: dto.status } : {},
    });

    await this.audit.record({
      userId: actingAdminId,
      action:
        dto.status === 'RESOLVED' ? 'INQUIRY_RESOLVED' : 'INQUIRY_UPDATED',
      resource: 'Inquiry',
      resourceId: id,
      metadata: dto as Record<string, unknown>,
    });

    return updated;
  }

  async remove(id: string, actingAdminId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.inquiry.delete({ where: { id } });

    await this.audit.record({
      userId: actingAdminId,
      action: 'INQUIRY_DELETED',
      resource: 'Inquiry',
      resourceId: id,
    });
  }
}

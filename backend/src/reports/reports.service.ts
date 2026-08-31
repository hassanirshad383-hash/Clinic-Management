import { Injectable, NotFoundException } from '@nestjs/common';
import type { UltrasoundReport } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import type { Paginated, PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { CreateReportDto } from './dto/create-report.dto.js';
import type { UpdateReportDto } from './dto/update-report.dto.js';

/**
 * Future-ready module for ultrasound reporting. No public endpoint exists
 * or should ever be added here without a dedicated, strictly-scoped
 * authorization design (e.g. a one-time patient access token) — never a
 * bare "get report by id" open to anyone with the id.
 */
@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateReportDto,
    actingAdminId: string,
  ): Promise<UltrasoundReport> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const report = await this.prisma.ultrasoundReport.create({
      data: {
        patientId: dto.patientId,
        reportType: dto.reportType,
        reportDate: new Date(dto.reportDate),
        status: dto.status,
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'REPORT_CREATED',
      resource: 'UltrasoundReport',
      resourceId: report.id,
    });

    return report;
  }

  async findAllForPatient(
    patientId: string,
    query: PaginationQueryDto,
  ): Promise<Paginated<UltrasoundReport>> {
    const { page, limit } = query;
    const where = { patientId };

    const [data, total] = await Promise.all([
      this.prisma.ultrasoundReport.findMany({
        where,
        orderBy: { reportDate: 'desc' },
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.ultrasoundReport.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: string): Promise<UltrasoundReport> {
    const report = await this.prisma.ultrasoundReport.findUnique({
      where: { id },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async update(
    id: string,
    dto: UpdateReportDto,
    actingAdminId: string,
  ): Promise<UltrasoundReport> {
    await this.findOne(id);

    const updated = await this.prisma.ultrasoundReport.update({
      where: { id },
      data: dto.status !== undefined ? { status: dto.status } : {},
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'REPORT_UPDATED',
      resource: 'UltrasoundReport',
      resourceId: id,
      metadata: dto as Record<string, unknown>,
    });

    return updated;
  }
}

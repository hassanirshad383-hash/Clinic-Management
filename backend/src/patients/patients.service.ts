import { Injectable, NotFoundException } from '@nestjs/common';
import type { Patient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import type { Paginated } from '../common/dto/pagination-query.dto.js';
import type { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import type { CreatePatientDto } from './dto/create-patient.dto.js';
import type { UpdatePatientDto } from './dto/update-patient.dto.js';

/**
 * Future-ready, strictly protected module. No public endpoints exist for
 * patient data anywhere in this API — every route here requires an admin
 * role (enforced at the controller via @Roles()).
 */
@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreatePatientDto, actingAdminId: string): Promise<Patient> {
    const patient = await this.prisma.patient.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'PATIENT_CREATED',
      resource: 'Patient',
      resourceId: patient.id,
    });

    return patient;
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Patient>> {
    const { page, limit } = query;

    const [data, total] = await Promise.all([
      this.prisma.patient.findMany({
        orderBy: { createdAt: 'desc' },
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.patient.count(),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }
    return patient;
  }

  async update(
    id: string,
    dto: UpdatePatientDto,
    actingAdminId: string,
  ): Promise<Patient> {
    await this.findOne(id);

    const updated = await this.prisma.patient.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.dateOfBirth !== undefined
          ? { dateOfBirth: new Date(dto.dateOfBirth) }
          : {}),
        ...(dto.gender !== undefined ? { gender: dto.gender } : {}),
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'PATIENT_UPDATED',
      resource: 'Patient',
      resourceId: id,
    });

    return updated;
  }
}

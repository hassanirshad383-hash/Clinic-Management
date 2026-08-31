import { Injectable } from '@nestjs/common';
import type { ClinicSettings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { UpdateClinicDto } from './dto/update-clinic.dto.js';

const SETTINGS_ID = 1;

@Injectable()
export class ClinicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async get(): Promise<ClinicSettings> {
    const settings = await this.prisma.clinicSettings.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (settings) return settings;

    // Should always exist after seeding, but fail gracefully rather than
    // 500 if the singleton row is somehow missing.
    return this.prisma.clinicSettings.create({
      data: {
        id: SETTINGS_ID,
        name: 'Irfan Diagnostic Centre',
        addressLine1: 'Stadium Road',
        addressLine2: 'Opposite Civil Hospital, Daska',
        hours: '10:00 AM – 3:00 PM',
      },
    });
  }

  async update(
    dto: UpdateClinicDto,
    actingAdminId: string,
  ): Promise<ClinicSettings> {
    await this.get(); // ensure the row exists

    const updated = await this.prisma.clinicSettings.update({
      where: { id: SETTINGS_ID },
      data: dto,
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'CLINIC_SETTINGS_UPDATED',
      resource: 'ClinicSettings',
      resourceId: String(SETTINGS_ID),
      metadata: dto as Record<string, unknown>,
    });

    return updated;
  }
}

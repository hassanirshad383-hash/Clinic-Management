import { Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, type AppointmentRequest } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import type { Paginated } from '../common/dto/pagination-query.dto.js';
import type { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import type { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import type { QueryAppointmentDto } from './dto/query-appointment.dto.js';

const STATUS_AUDIT_ACTION: Record<AppointmentStatus, string> = {
  PENDING: 'APPOINTMENT_REOPENED',
  CONFIRMED: 'APPOINTMENT_CONFIRMED',
  CANCELLED: 'APPOINTMENT_CANCELLED',
  COMPLETED: 'APPOINTMENT_COMPLETED',
  NO_SHOW: 'APPOINTMENT_NO_SHOW',
};

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<AppointmentRequest> {
    const appointment = await this.prisma.appointmentRequest.create({
      data: {
        patientName: dto.patientName,
        patientPhone: dto.patientPhone,
        requestedService: dto.requestedService,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : null,
        preferredTime: dto.preferredTime,
        message: dto.message,
      },
    });

    await this.notifications.notifyAppointmentRequested({
      id: appointment.id,
      patientName: appointment.patientName,
      requestedService: appointment.requestedService,
    });

    return appointment;
  }

  async findAll(query: QueryAppointmentDto): Promise<Paginated<AppointmentRequest>> {
    const { page, limit, status, date, service } = query;

    const where = {
      ...(status ? { status } : {}),
      ...(date
        ? {
            preferredDate: {
              gte: new Date(`${date}T00:00:00.000Z`),
              lt: new Date(`${date}T23:59:59.999Z`),
            },
          }
        : {}),
      ...(service
        ? { requestedService: { contains: service, mode: 'insensitive' as const } }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.appointmentRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.appointmentRequest.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }

  async findOne(id: string): Promise<AppointmentRequest> {
    const appointment = await this.prisma.appointmentRequest.findUnique({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException('Appointment request not found');
    }
    return appointment;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    actingAdminId: string,
  ): Promise<AppointmentRequest> {
    const existing = await this.findOne(id);

    const updated = await this.prisma.appointmentRequest.update({
      where: { id },
      data: {
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.preferredDate !== undefined
          ? { preferredDate: new Date(dto.preferredDate) }
          : {}),
        ...(dto.preferredTime !== undefined
          ? { preferredTime: dto.preferredTime }
          : {}),
        ...(dto.message !== undefined ? { message: dto.message } : {}),
      },
    });

    if (dto.status && dto.status !== existing.status) {
      await this.audit.record({
        userId: actingAdminId,
        action: STATUS_AUDIT_ACTION[dto.status],
        resource: 'AppointmentRequest',
        resourceId: id,
        metadata: { from: existing.status, to: dto.status },
      });

      if (dto.status === AppointmentStatus.CONFIRMED) {
        await this.notifications.notifyAppointmentConfirmed({
          id: updated.id,
          patientName: updated.patientName,
        });
      }
      if (dto.status === AppointmentStatus.CANCELLED) {
        await this.notifications.notifyAppointmentCancelled({
          id: updated.id,
          patientName: updated.patientName,
        });
      }
    } else {
      await this.audit.record({
        userId: actingAdminId,
        action: 'APPOINTMENT_UPDATED',
        resource: 'AppointmentRequest',
        resourceId: id,
      });
    }

    return updated;
  }

  async remove(id: string, actingAdminId: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.appointmentRequest.delete({ where: { id } });

    await this.audit.record({
      userId: actingAdminId,
      action: 'APPOINTMENT_DELETED',
      resource: 'AppointmentRequest',
      resourceId: id,
    });
  }
}

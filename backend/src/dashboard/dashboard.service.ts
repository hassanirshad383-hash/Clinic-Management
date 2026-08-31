import { Injectable } from '@nestjs/common';
import { AppointmentStatus, InquiryStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface DashboardSummary {
  appointments: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  inquiries: {
    new: number;
    read: number;
    resolved: number;
  };
  services: {
    active: number;
    inactive: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // Aggregate counts only — never surfaces individual patient/inquiry
  // records here.
  async getSummary(): Promise<DashboardSummary> {
    const [
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      newInquiries,
      readInquiries,
      resolvedInquiries,
      activeServices,
      inactiveServices,
    ] = await Promise.all([
      this.prisma.appointmentRequest.count({
        where: { status: AppointmentStatus.PENDING },
      }),
      this.prisma.appointmentRequest.count({
        where: { status: AppointmentStatus.CONFIRMED },
      }),
      this.prisma.appointmentRequest.count({
        where: { status: AppointmentStatus.COMPLETED },
      }),
      this.prisma.appointmentRequest.count({
        where: { status: AppointmentStatus.CANCELLED },
      }),
      this.prisma.appointmentRequest.count({
        where: { status: AppointmentStatus.NO_SHOW },
      }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.READ } }),
      this.prisma.inquiry.count({
        where: { status: InquiryStatus.RESOLVED },
      }),
      this.prisma.service.count({ where: { isActive: true } }),
      this.prisma.service.count({ where: { isActive: false } }),
    ]);

    return {
      appointments: { pending, confirmed, completed, cancelled, noShow },
      inquiries: {
        new: newInquiries,
        read: readInquiries,
        resolved: resolvedInquiries,
      },
      services: { active: activeServices, inactive: inactiveServices },
    };
  }
}

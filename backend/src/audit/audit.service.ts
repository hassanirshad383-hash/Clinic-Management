import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

export interface RecordAuditEntry {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

/**
 * Records administrative actions for accountability. Never pass passwords,
 * tokens, or unnecessary personal/medical data in `metadata`.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async record(entry: RecordAuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId ?? null,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId ?? null,
          metadata: entry.metadata as Prisma.InputJsonValue | undefined,
          ipAddress: entry.ipAddress ?? null,
        },
      });
    } catch (error) {
      // Audit logging must never break the primary request flow.
      this.logger.error(
        `Failed to write audit log for action ${entry.action}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}

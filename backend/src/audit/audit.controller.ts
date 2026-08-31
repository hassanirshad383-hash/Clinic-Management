import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { buildPaginated, paginationSkip } from '../common/utils/paginate.js';
import { QueryAuditLogDto } from './dto/query-audit-log.dto.js';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit-logs')
@Roles(AdminRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Query() query: QueryAuditLogDto) {
    const { page, limit, resource, action, userId } = query;

    const where = {
      ...(resource ? { resource } : {}),
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: paginationSkip(page, limit),
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginated(data, total, page, limit);
  }
}

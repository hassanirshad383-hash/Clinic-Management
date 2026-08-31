import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Operational summary counts (admin)' })
  getSummary() {
    return this.dashboardService.getSummary();
  }
}

import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { ReportsService } from './reports.service.js';
import { CreateReportDto } from './dto/create-report.dto.js';
import { UpdateReportDto } from './dto/update-report.dto.js';

// Strictly protected — never expose ultrasound reports publicly.
@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an ultrasound report record (admin)' })
  create(@Body() dto: CreateReportDto, @CurrentUser() user: RequestUser) {
    return this.reportsService.create(dto, user.id);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: "List a patient's reports (admin)" })
  findAllForPatient(
    @Param('patientId') patientId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.reportsService.findAllForPatient(patientId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single report (admin)' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update report status (admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.reportsService.update(id, dto, user.id);
  }
}

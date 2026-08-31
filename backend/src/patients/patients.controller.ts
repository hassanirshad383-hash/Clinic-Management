import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PatientsService } from './patients.service.js';
import { CreatePatientDto } from './dto/create-patient.dto.js';
import { UpdatePatientDto } from './dto/update-patient.dto.js';

// Strictly protected — no @Public() routes exist in this module.
@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a patient record (admin)' })
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: RequestUser) {
    return this.patientsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List patient records (admin)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a patient record (admin)' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient record (admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.patientsService.update(id, dto, user.id);
  }
}

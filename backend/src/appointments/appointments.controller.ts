import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';
import { QueryAppointmentDto } from './dto/query-appointment.dto.js';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Public()
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @Post()
  @ApiOperation({ summary: 'Submit an appointment request (public)' })
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF)
  @ApiOperation({ summary: 'List appointment requests (admin)' })
  findAll(@Query() query: QueryAppointmentDto) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF)
  @ApiOperation({ summary: 'Get a single appointment request (admin)' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'Update / confirm / cancel an appointment request (admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.appointmentsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an appointment request (admin)' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.appointmentsService.remove(id, user.id);
  }
}

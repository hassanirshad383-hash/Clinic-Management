import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { ClinicService } from './clinic.service.js';
import { UpdateClinicDto } from './dto/update-clinic.dto.js';

@ApiTags('clinic')
@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get clinic information (public)' })
  get() {
    return this.clinicService.get();
  }

  @Patch()
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update clinic information (admin)' })
  update(@Body() dto: UpdateClinicDto, @CurrentUser() user: RequestUser) {
    return this.clinicService.update(dto, user.id);
  }
}

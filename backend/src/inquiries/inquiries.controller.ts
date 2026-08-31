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
import { InquiriesService } from './inquiries.service.js';
import { CreateInquiryDto } from './dto/create-inquiry.dto.js';
import { UpdateInquiryDto } from './dto/update-inquiry.dto.js';
import { QueryInquiryDto } from './dto/query-inquiry.dto.js';

@ApiTags('inquiries')
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Public()
  @Throttle({ public: { limit: 5, ttl: 60_000 } })
  @Post()
  @ApiOperation({ summary: 'Submit a contact inquiry (public)' })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF)
  @ApiOperation({ summary: 'List contact inquiries (admin)' })
  findAll(@Query() query: QueryInquiryDto) {
    return this.inquiriesService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.STAFF)
  @ApiOperation({ summary: 'Get a single inquiry (admin)' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'Update inquiry status (admin)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInquiryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.inquiriesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an inquiry (admin)' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.inquiriesService.remove(id, user.id);
  }
}

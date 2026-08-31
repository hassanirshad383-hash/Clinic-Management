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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { ServicesService } from './services.service.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { QueryServiceDto } from './dto/query-service.dto.js';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // --- Admin management (registered before the public :slug route below) ---

  @Get('admin')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'List all services, including inactive (admin)' })
  findAllForAdmin(@Query() query: QueryServiceDto) {
    return this.servicesService.findAllForAdmin(query);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'Get any service by id, including inactive (admin)' })
  findByIdForAdmin(@Param('id') id: string) {
    return this.servicesService.findByIdForAdmin(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'Create a new ultrasound service' })
  create(@Body() dto: CreateServiceDto, @CurrentUser() user: RequestUser) {
    return this.servicesService.create(dto, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  @ApiOperation({ summary: 'Update an ultrasound service' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.servicesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete an ultrasound service' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.servicesService.remove(id, user.id);
  }

  // --- Public catalog ---

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active ultrasound services (public)' })
  findPublic(@Query() query: QueryServiceDto) {
    return this.servicesService.findPublic(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a single active service by slug (public)' })
  findPublicBySlug(@Param('slug') slug: string) {
    return this.servicesService.findPublicBySlug(slug);
  }
}

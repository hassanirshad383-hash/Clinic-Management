import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AdminRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { RequestUser } from '../common/types/authenticated-request.js';
import { FilesService } from './files.service.js';
import type { UploadedMulterFile } from './types/uploaded-file.js';

// Strictly protected — files are never served through a public route.
@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
@Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file (admin)' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile() file: UploadedMulterFile | undefined,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.filesService.upload(file, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file metadata (admin)' })
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file (admin)' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const { asset, buffer } = await this.filesService.getBuffer(id);
    res.set({
      'Content-Type': asset.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(asset.filename)}"`,
    });
    res.send(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file (admin)' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.filesService.remove(id, user.id);
  }
}

import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { FilesController } from './files.controller.js';
import { FilesService } from './files.service.js';
import { LocalStorageProvider } from './storage/local-storage.provider.js';

@Module({
  imports: [AuditModule],
  controllers: [FilesController],
  providers: [FilesService, LocalStorageProvider],
})
export class FilesModule {}

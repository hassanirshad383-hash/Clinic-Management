import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FileAsset } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { LocalStorageProvider } from './storage/local-storage.provider.js';
import { UnconfiguredStorageProvider } from './storage/unconfigured-storage.provider.js';
import type { StorageProvider } from './storage/storage.interface.js';

export interface UploadInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

@Injectable()
export class FilesService {
  private readonly provider: StorageProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
    localStorageProvider: LocalStorageProvider,
  ) {
    const providerName = this.config.get<string>('STORAGE_PROVIDER') ?? 'local';
    this.provider =
      providerName === 'local'
        ? localStorageProvider
        : new UnconfiguredStorageProvider(providerName);
  }

  async upload(
    file: UploadInput,
    actingAdminId: string,
    relatedReportId?: string,
  ): Promise<FileAsset> {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File exceeds the maximum allowed size (15MB)');
    }

    const saved = await this.provider.save(file.buffer, file.originalname);

    const asset = await this.prisma.fileAsset.create({
      data: {
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storageProvider: saved.storageProvider,
        storageKey: saved.storageKey,
        uploadedByAdminId: actingAdminId,
        ultrasoundReportId: relatedReportId,
      },
    });

    await this.audit.record({
      userId: actingAdminId,
      action: 'FILE_UPLOADED',
      resource: 'FileAsset',
      resourceId: asset.id,
      metadata: { filename: asset.filename, size: asset.size },
    });

    return asset;
  }

  async getBuffer(id: string): Promise<{ asset: FileAsset; buffer: Buffer }> {
    const asset = await this.findOne(id);
    const buffer = await this.provider.read(asset.storageKey);
    return { asset, buffer };
  }

  async findOne(id: string): Promise<FileAsset> {
    const asset = await this.prisma.fileAsset.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('File not found');
    }
    return asset;
  }

  async remove(id: string, actingAdminId: string): Promise<void> {
    const asset = await this.findOne(id);
    await this.provider.delete(asset.storageKey);
    await this.prisma.fileAsset.delete({ where: { id } });

    await this.audit.record({
      userId: actingAdminId,
      action: 'FILE_DELETED',
      resource: 'FileAsset',
      resourceId: id,
    });
  }
}

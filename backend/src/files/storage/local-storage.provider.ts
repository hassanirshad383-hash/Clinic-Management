import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { SavedFile, StorageProvider } from './storage.interface.js';

// NOTE: This provider writes to local disk. On serverless platforms (e.g.
// Vercel) only the OS temp directory is writable and it is NOT persisted
// between invocations or deployments, so files saved here will not survive.
// It is intended for local development / traditional long-running servers.
// For durable production storage on serverless, implement and configure a
// real STORAGE_PROVIDER (e.g. S3-compatible object storage).
const UPLOAD_DIR =
  process.env.LOCAL_STORAGE_DIR ??
  join(process.env.VERCEL ? '/tmp' : process.cwd(), 'uploads');

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly ready = mkdir(UPLOAD_DIR, { recursive: true });

  async save(buffer: Buffer, originalName: string): Promise<SavedFile> {
    await this.ready;
    const ext = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.'))
      : '';
    const key = `${randomUUID()}${ext}`;
    await writeFile(join(UPLOAD_DIR, key), buffer);
    return { storageProvider: 'local', storageKey: key };
  }

  async read(storageKey: string): Promise<Buffer> {
    return readFile(join(UPLOAD_DIR, storageKey));
  }

  async delete(storageKey: string): Promise<void> {
    await rm(join(UPLOAD_DIR, storageKey), { force: true });
  }
}


import type { SavedFile, StorageProvider } from './storage.interface.js';

// Placeholder used when STORAGE_PROVIDER is set to something other than
// "local" (e.g. "s3") but no real implementation has been wired up yet.
// Fails clearly instead of silently doing nothing.
export class UnconfiguredStorageProvider implements StorageProvider {
  constructor(private readonly providerName: string) {}

  private fail(): never {
    throw new Error(
      `Storage provider "${this.providerName}" is not configured. ` +
        'Set STORAGE_PROVIDER=local or implement this provider.',
    );
  }

  async save(): Promise<SavedFile> {
    this.fail();
  }

  async read(): Promise<Buffer> {
    this.fail();
  }

  async delete(): Promise<void> {
    this.fail();
  }
}


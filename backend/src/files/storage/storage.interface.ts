export interface SavedFile {
  storageProvider: string;
  storageKey: string;
}

export interface StorageProvider {
  save(buffer: Buffer, originalName: string): Promise<SavedFile>;
  read(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
}


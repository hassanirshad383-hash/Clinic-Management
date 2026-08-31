// Minimal shape of what multer's memoryStorage hands FileInterceptor —
// avoids depending on @types/multer just for this one type.
export interface UploadedMulterFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

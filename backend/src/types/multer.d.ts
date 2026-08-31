// Minimal ambient shim — multer ships without types and we intentionally
// avoid pulling in @types/multer for the one function we use.
declare module 'multer' {
  export function memoryStorage(): unknown;
}

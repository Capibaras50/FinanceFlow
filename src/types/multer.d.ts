import { File } from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      export type File = import('multer').File;
    }
  }
}

declare module 'multer' {
  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    destination?: string;
    filename?: string;
    path?: string;
  }
}

export {};

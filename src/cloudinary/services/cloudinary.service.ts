import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import * as streamifier from 'streamifier';
import axios from 'axios';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File) {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'finance-flow',
          resource_type: 'auto',
        },
        (err: unknown, result: unknown) => {
          if (err) {
            const message =
              err instanceof Error ? err.message : 'Upload failed';
            return reject(new Error(message));
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const url = (result as any)?.secure_url || (result as any)?.url;
          if (!url) return reject(new Error('Upload failed: No URL returned'));
          resolve(url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }

  async getFileAsBase64(fileUrl: string) {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    const contentType = (response.headers['content-type'] ||
      response.headers['Content-Type']) as string;
    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    const sizeBytes = buffer.byteLength;

    return { mimeType: contentType, base64, sizeBytes };
  }
}

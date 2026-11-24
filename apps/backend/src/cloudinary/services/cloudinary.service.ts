import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
}
import * as streamifier from 'streamifier';
import axios from 'axios';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File) {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.upload(file);
      } catch (err) {
        const code =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          typeof (err as { code?: unknown }).code === 'string'
            ? (err as { code: string }).code
            : '';
        const retriyable = ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'].includes(
          code,
        );

        if (!retriyable || attempt === maxRetries) {
          throw new InternalServerErrorException(
            'The receipt couldnt be sent to the server',
          );
        }

        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new InternalServerErrorException(
      'The receipt couldnt be sent to the server',
    );
  }

  async uploadBuffer(
    buffer: Buffer | ArrayBuffer,
    options: UploadApiOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const nodeBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'finance-flow', resource_type: 'raw', ...options },
        (error, result) => {
          if (error) {
            reject(new Error(error.message));
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new Error('Upload failed: Incomplete response'));
            return;
          }
          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format || result.public_id.split('.').pop() || '',
          });
        },
      );

      streamifier.createReadStream(nodeBuffer).pipe(stream);
    });
  }

  getPrivateDownloadUrl(
    publicId: string,
    format: string,
    expiresInSeconds = 86400,
  ): string {
    return cloudinary.utils.private_download_url(publicId, format, {
      resource_type: 'raw',
      type: 'authenticated',
      attachment: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
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

  private upload(file: Express.Multer.File) {
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

          const url =
            typeof result === 'object' &&
            result !== null &&
            'secure_url' in result &&
            'url' in result &&
            typeof (result as { secure_url?: unknown; url?: unknown })
              .secure_url === 'string' &&
            typeof (result as { secure_url?: unknown; url?: unknown }).url ===
              'string'
              ? result?.secure_url || result?.url
              : undefined;
          if (!url) return reject(new Error('Upload failed: No URL returned'));
          resolve(url);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}

import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import * as streamifier from 'streamifier';
import axios from 'axios';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File) {
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
            reject(new Error(message));
          } else {
            resolve(result);
          }
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
    const base64 = Buffer.from(response.data).toString('base64');

    return { mimeType: contentType, base64 };
  }
}

export declare class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<unknown>;
    getFileAsBase64(fileUrl: string): Promise<{
        mimeType: string;
        base64: string;
        sizeBytes: number;
    }>;
}

import { ReceiptService } from '../services/receipt.service';
import { CloudinaryService } from "../../cloudinary/services/cloudinary.service";
export declare class ReceiptController {
    private receiptService;
    private cloudinaryService;
    constructor(receiptService: ReceiptService, cloudinaryService: CloudinaryService);
    findOne(id: number, profileId: number): Promise<import("../entities/receipt.entity").Receipt>;
    findAll(profileId: number): Promise<import("../entities/receipt.entity").Receipt[]>;
    create(profileId: number, receipt: Express.Multer.File): Promise<{
        message: string;
    }>;
    remove(id: number, profileId: number): Promise<{
        id: number;
    }>;
}

import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from "../../cloudinary/services/cloudinary.service";
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { Queue } from 'bullmq';
export declare class ReceiptService {
    private receiptRepository;
    private cloudinaryService;
    private walletService;
    private categoriesService;
    private queue;
    constructor(receiptRepository: Repository<Receipt>, cloudinaryService: CloudinaryService, walletService: WalletsService, categoriesService: CategoriesService, queue: Queue);
    findOne(id: number, profileId: number): Promise<Receipt>;
    findAll(profileId: number): Promise<Receipt[]>;
    create(receiptUrl: string, profileId: number): Promise<{
        message: string;
    }>;
    remove(id: number, profileId: number): Promise<{
        id: number;
    }>;
}

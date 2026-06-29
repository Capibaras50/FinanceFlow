import { Profile } from "../../users/entities/profile.entity";
import { ReceiptStatus } from '../enums/receipt.enums';
import { Expense } from './expense.entity';
export declare class Receipt {
    id: number;
    profile: Profile;
    fileUrl: string;
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    status: ReceiptStatus;
    jobId: string;
    attempts: number;
    lastError: string;
    extractionConfidence: number;
    expense: Expense;
    createdAt: Date;
    updatedAt: Date;
    processedAt: Date;
}

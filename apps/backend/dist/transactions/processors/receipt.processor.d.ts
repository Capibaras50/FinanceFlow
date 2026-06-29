import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateReceiptInterface } from '../interfaces/create-receipt.interface';
import { AiService } from "../../ai/services/ai.service";
import { ExpenseService } from '../services/expense.service';
export declare class ReceiptProcessor extends WorkerHost {
    private aiService;
    private expenseService;
    constructor(aiService: AiService, expenseService: ExpenseService);
    process(job: Job<CreateReceiptInterface>): Promise<void>;
    createReceipt(job: Job<CreateReceiptInterface>): Promise<void>;
}

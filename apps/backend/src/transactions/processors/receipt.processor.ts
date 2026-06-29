import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CreateReceiptInterface } from '../interfaces/create-receipt.interface';
import { AiService } from 'src/ai/services/ai.service';
import { ExpenseService } from '../services/expense.service';

@Processor('receipt.expense.created')
export class ReceiptProcessor extends WorkerHost {
  constructor(
    private aiService: AiService,
    private expenseService: ExpenseService,
  ) {
    super();
  }
  async process(job: Job<CreateReceiptInterface>) {
    switch (job.name) {
      case 'create-receipt':
        return this.createReceipt(job);
      default:
        throw new Error(`Job no soportado: ${job.name}`);
    }
  }

  async createReceipt(job: Job<CreateReceiptInterface>) {
    const {
      profileId,
      receiptUrl,
      base64,
      systemPrompt,
      mimeType,
      userMessage,
      sizeBytes,
    } = job.data;
    await job.updateProgress(30);
    console.log(`Processing Receipt: ${receiptUrl}`);
    const extractedData = await this.aiService.extractDataReceipt(
      base64,
      systemPrompt,
      mimeType,
      userMessage,
    );
    await job.updateProgress(65);
    await this.expenseService.createExpenseFromReceipt(
      extractedData.name,
      extractedData.description,
      extractedData.value,
      extractedData.walletName,
      extractedData.categoryName,
      profileId,
      extractedData.fileName,
      sizeBytes,
      mimeType,
      receiptUrl,
      extractedData.extractionConfidence,
      job.id,
      job.attemptsMade,
      undefined,
    );
    console.log(`Processed Receipt: ${receiptUrl}`);
    await job.updateProgress(100);
  }
}

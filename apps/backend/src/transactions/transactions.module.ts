import { Module } from '@nestjs/common';
import { TransactionsBaseModule } from './transactions-base.module';
import { ExpenseController } from './controllers/expense.controller';
import { ReceiptController } from './controllers/receipt.controller';
import { EarningController } from './controllers/earning.controller';
import { ReceiptProcessor } from './processors/receipt.processor';
import { AiModule } from 'src/ai/ai.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  imports: [TransactionsBaseModule, AiModule, CloudinaryModule],
  controllers: [
    ExpenseController,
    ReceiptController,
    EarningController,
    TransactionController,
  ],
  providers: [ReceiptProcessor],
  exports: [TransactionsBaseModule],
})
export class TransactionsModule {}

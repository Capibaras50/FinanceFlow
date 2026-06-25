import { Module } from '@nestjs/common';
import { Expense } from './entities/expense.entity';
import { Earning } from './entities/earning.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entities/receipt.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { ExpenseController } from './controllers/expense.controller';
import { ExpenseService } from './services/expense.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ReceiptService } from './services/receipt.service';
import { ReceiptController } from './controllers/receipt.controller';
import { AiModule } from 'src/ai/ai.module';
import { ReceiptProcessor } from './processors/receipt.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Earning, Receipt]),
    BullModule.registerQueueAsync({
      name: 'receipt.expense.created',
    }),
    WalletsModule,
    CategoriesModule,
    CloudinaryModule,
    AiModule,
  ],
  controllers: [ExpenseController, ReceiptController],
  providers: [ExpenseService, ReceiptService, ReceiptProcessor],
  exports: [ExpenseService, ReceiptService],
})
export class TransactionsModule {}

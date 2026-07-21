import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Expense } from './entities/expense.entity';
import { Earning } from './entities/earning.entity';
import { Receipt } from './entities/receipt.entity';
import { ExpenseService } from './services/expense.service';
import { ReceiptService } from './services/receipt.service';
import { EarningService } from './services/earning.service';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Earning, Receipt]),
    BullModule.registerQueueAsync({
      name: 'receipt.expense.created',
    }),
    WalletsModule,
    CategoriesModule,
    CloudinaryModule,
  ],
  providers: [ExpenseService, ReceiptService, EarningService],
  exports: [ExpenseService, ReceiptService, EarningService],
})
export class TransactionsBaseModule {}

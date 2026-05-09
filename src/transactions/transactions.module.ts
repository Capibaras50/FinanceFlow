import { Module } from '@nestjs/common';
import { Expense } from './entities/expense.entity';
import { Earning } from './entities/earning.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Receipt } from './entities/receipt.entity';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { ExpenseController } from './controllers/expense.controller';
import { ExpenseService } from './services/expense.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense, Earning, Receipt]),
    WalletsModule,
    CategoriesModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class TransactionsModule {}

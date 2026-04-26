import { Module } from '@nestjs/common';
import { Expense } from './entities/expense.entity';
import { Earning } from './entities/earning.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Earning])],
  controllers: [],
  providers: [],
})
export class TransactionsModule {}

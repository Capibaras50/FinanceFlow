import { Module } from '@nestjs/common';
import { DebtsService } from './services/debts.service';
import { DebtsController } from './controllers/debts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Debt } from './entities/debt.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Debt]),
    CloudinaryModule,
    ContactsModule,
    WalletsModule,
    TransactionsModule,
    CategoriesModule,
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService],
})
export class DebtsModule {}

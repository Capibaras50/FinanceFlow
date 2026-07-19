import { Module } from '@nestjs/common';
import { TransactionInferenceService } from './services/transaction-inference.service';
import { WalletsModule } from 'src/wallets/wallets.module';
import { LlmModule } from 'src/ai/llm.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [CategoriesModule, WalletsModule, LlmModule],
  providers: [TransactionInferenceService],
  exports: [TransactionInferenceService],
})
export class TransactionInferenceModule {}

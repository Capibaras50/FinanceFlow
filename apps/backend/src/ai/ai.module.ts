import { Module, forwardRef } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { FinancialToolsModule } from 'src/financial-tools/financial-tools.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    forwardRef(() => FinancialToolsModule),
    CategoriesModule,
    WalletsModule,
  ],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

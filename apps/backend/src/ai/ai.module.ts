import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { FinancialToolsModule } from 'src/financial-tools/financial-tools.module';

@Module({
  imports: [FinancialToolsModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

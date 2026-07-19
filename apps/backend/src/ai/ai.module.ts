import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { LlmModule } from './llm.module';
import { FinancialToolsModule } from 'src/financial-tools/financial-tools.module';

@Module({
  imports: [LlmModule, FinancialToolsModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

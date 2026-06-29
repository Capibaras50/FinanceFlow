import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { Injectable } from '@nestjs/common';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetMonthlySummaryArgs {
  month: number;
}

interface MonthlySummaryResult {
  totalExpenses: string | undefined;
  totalEarnings: string | undefined;
  balance: number;
  numExpenses: string | undefined;
  numEarnings: string | undefined;
  numTransactions: number;
}

@Injectable()
export class GetMonthlySummaryTool implements Tool<
  GetMonthlySummaryArgs,
  MonthlySummaryResult
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getMonthlySummary';

  readonly description: string =
    'Returns a financial summary for a given month (1-12) with totals, balance, and transaction counts';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      month: {
        type: 'number',
        description: 'Month number (1 = January, 12 = December)',
      },
    },
    required: ['month'],
  };

  async execute(
    profileId: number,
    args: GetMonthlySummaryArgs,
  ): Promise<MonthlySummaryResult> {
    return await this.financialToolsService.getMonthlySummary(
      profileId,
      args.month,
    );
  }
}

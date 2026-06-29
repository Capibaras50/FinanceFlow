import { Expense } from 'src/transactions/entities/expense.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetExpensesByDateRangeArgs {
  startDate: string;
  endDate: string;
}

@Injectable()
export class GetExpensesByDateRangeTool implements Tool<
  GetExpensesByDateRangeArgs,
  Expense[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getExpensesByDateRange';

  readonly description: string =
    'Returns expenses within a date range (ISO 8601 format)';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      startDate: {
        type: 'string',
        description: 'Start date in ISO 8601 format (e.g., 2024-01-01)',
      },
      endDate: {
        type: 'string',
        description: 'End date in ISO 8601 format (e.g., 2024-12-31)',
      },
    },
    required: ['startDate', 'endDate'],
  };

  async execute(
    profileId: number,
    args: GetExpensesByDateRangeArgs,
  ): Promise<Expense[]> {
    return await this.financialToolsService.getExpensesByDateRange(
      new Date(args.startDate),
      new Date(args.endDate),
      profileId,
    );
  }
}

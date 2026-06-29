import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { Injectable } from '@nestjs/common';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetExpensesByCategoryArgs {
  categoryIds: number[];
}

interface ExpensesByCategoryResult {
  expenses: import('src/transactions/entities/expense.entity').Expense[];
  totalExpenses: number;
  addition: number | null;
}

@Injectable()
export class GetExpensesByCategoryTool implements Tool<
  GetExpensesByCategoryArgs,
  ExpensesByCategoryResult
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getExpensesByCategory';

  readonly description: string =
    'Returns expenses filtered by one or more category IDs, with total count and sum';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      categoryIds: {
        type: 'array',
        description: 'Array of category IDs to filter expenses by',
        items: { type: 'number' },
      },
    },
    required: ['categoryIds'],
  };

  async execute(
    profileId: number,
    args: GetExpensesByCategoryArgs,
  ): Promise<ExpensesByCategoryResult> {
    return await this.financialToolsService.getExpensesByCategory(
      args.categoryIds,
      profileId,
    );
  }
}

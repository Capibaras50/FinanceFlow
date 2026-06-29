import { Expense } from 'src/transactions/entities/expense.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetExpenseArgs {
  id: number;
}

@Injectable()
export class GetExpenseTool implements Tool<GetExpenseArgs, Expense> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getExpense';

  readonly description: string =
    'Returns an expense of the authenticated user by its ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the expense to retrieve',
      },
    },
    required: ['id'],
  };

  async execute(profileId: number, args: GetExpenseArgs): Promise<Expense> {
    return await this.financialToolsService.getExpense(args.id, profileId);
  }
}

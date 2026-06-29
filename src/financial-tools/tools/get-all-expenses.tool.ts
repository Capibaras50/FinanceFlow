import { Expense } from 'src/transactions/entities/expense.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

@Injectable()
export class GetAllExpensesTool implements Tool<void, Expense[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllExpenses';

  readonly description: string =
    'Returns all expenses of the authenticated user.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {},
    required: [],
  };

  async execute(profileId: number): Promise<Expense[]> {
    return await this.financialToolsService.getAllExpenses(profileId);
  }
}

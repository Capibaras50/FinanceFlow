import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { Expense } from 'src/transactions/entities/expense.entity';
import { FinancialToolsService } from '../services/financial-tools.service';
import { CreateExpenseDto } from 'src/transactions/dto/create-expense.dto';

interface CreateExpenseArgs {
  name: string;
  description?: string;
  value: number;
  createdAt?: string;
}

@Injectable()
export class CreateExpenseTool implements Tool<CreateExpenseArgs, Expense> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'createExpense';

  readonly description: string =
    'Create a new expense in the db and return the expense saved. The category and wallet are inferred automatically from the transaction name.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of Expense that user insert.',
      },
      description: {
        type: 'string',
        description:
          'Description of Expense that user insert or you infer of the expense',
      },
      value: {
        type: 'number',
        description: 'Cost of Expense that user insert',
      },
      createdAt: {
        type: 'string',
        description:
          'The date in ISO 8601 format (e.g. 2026-07-13T15:00:00Z) to insert the expense. Only use if the user specifies a date but if the user put today for example you dont put this option.',
      },
    },
    required: ['name', 'value'],
  };

  async execute(profileId: number, args: CreateExpenseArgs): Promise<Expense> {
    const categoryId =
      await this.financialToolsService.inferBestCategoryTransaction(
        profileId,
        args.name,
      );
    const walletId =
      await this.financialToolsService.inferBestWalletTransaction(
        profileId,
        args.name,
      );
    const newExpense: CreateExpenseDto = {
      name: args.name,
      description: args.description ? args.description : undefined,
      value: args.value,
      walletId,
      categoriesId: [categoryId],
      createdAt: args.createdAt ? new Date(args.createdAt) : undefined,
    };
    return await this.financialToolsService.createExpense(
      profileId,
      newExpense,
    );
  }
}

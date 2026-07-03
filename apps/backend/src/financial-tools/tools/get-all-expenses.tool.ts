import { Expense } from 'src/transactions/entities/expense.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
import { FilterTransactionDto } from 'src/transactions/dto/filter-transaction.dto';

interface GetAllExpensesArgs {
  category?: string;
  wallet?: string;
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

@Injectable()
export class GetAllExpensesTool implements Tool<GetAllExpensesArgs, Expense[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllExpenses';

  readonly description: string =
    'Returns all expenses of the authenticated user. Can be filtered by category, wallet, sorted by value or date, and paginated.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter by category name (e.g., "Comida", "Transporte")',
      },
      wallet: {
        type: 'string',
        description: 'Filter by wallet name (e.g., "Efectivo", "Mercado Pago")',
      },
      sortBy: {
        type: 'string',
        enum: ['value', 'createdAt'],
        description: 'Field to sort by',
      },
      sortOrder: {
        type: 'string',
        enum: ['ASC', 'DESC'],
        description: 'Sort direction (default: DESC)',
      },
      page: {
        type: 'number',
        description: 'Page number (starts at 1, default: 1)',
      },
      limit: {
        type: 'number',
        description: 'Items per page (default: 10, max: 100)',
      },
    },
    required: [],
  };

  async execute(
    profileId: number,
    args: GetAllExpensesArgs,
  ): Promise<Expense[]> {
    const filterDto = new FilterTransactionDto();
    if (args.category) filterDto.category = args.category;
    if (args.wallet) filterDto.wallet = args.wallet;
    if (args.sortBy) filterDto.sortBy = args.sortBy;
    if (args.sortOrder) filterDto.sortOrder = args.sortOrder;
    if (args.page) filterDto.page = args.page;
    if (args.limit) filterDto.limit = args.limit;

    return await this.financialToolsService.getAllExpenses(
      profileId,
      filterDto,
    );
  }
}

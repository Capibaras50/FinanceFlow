import { Receipt } from 'src/transactions/entities/receipt.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetAllReceiptsArgs {
  limit?: number;
  page?: number;
}

@Injectable()
export class GetAllReceiptsTool implements Tool<GetAllReceiptsArgs, Receipt[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllReceipts';

  readonly description: string =
    'Returns all receipts of the authenticated user, you can use pagination.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Items per page (default: 10, max: 100)',
      },
      page: {
        type: 'number',
        description: 'Page number (starts at 1, default: 1)',
      },
    },
    required: [],
  };

  async execute(
    profileId: number,
    args: GetAllReceiptsArgs,
  ): Promise<Receipt[]> {
    return await this.financialToolsService.getAllReceipts(
      profileId,
      args.limit,
      args.page,
    );
  }
}

import { Wallet } from 'src/wallets/entities/wallets.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetAllWalletsArgs {
  limit?: number;
  page?: number;
}

@Injectable()
export class GetAllWalletsTool implements Tool<GetAllWalletsArgs, Wallet[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllWallets';

  readonly description: string =
    'Returns all wallets of the authenticated user, you can use pagination.';

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

  async execute(profileId: number, args: GetAllWalletsArgs): Promise<Wallet[]> {
    return await this.financialToolsService.getAllWallets(
      profileId,
      args.limit,
      args.page,
    );
  }
}

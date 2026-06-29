import { Wallet } from 'src/wallets/entities/wallets.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetWalletArgs {
  id: number;
}

@Injectable()
export class GetWalletTool implements Tool<GetWalletArgs, Wallet> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getWallet';

  readonly description: string =
    'Returns a wallet of the authenticated user by its ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the wallet to retrieve',
      },
    },
    required: ['id'],
  };

  async execute(profileId: number, args: GetWalletArgs): Promise<Wallet> {
    return await this.financialToolsService.getWallet(args.id, profileId);
  }
}

import { Wallet } from 'src/wallets/entities/wallets.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

@Injectable()
export class GetAllWalletsTool implements Tool<void, Wallet[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllWallets';

  readonly description: string =
    'Returns all wallets of the authenticated user.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {},
    required: [],
  };

  async execute(profileId: number): Promise<Wallet[]> {
    return await this.financialToolsService.getAllWallets(profileId);
  }
}

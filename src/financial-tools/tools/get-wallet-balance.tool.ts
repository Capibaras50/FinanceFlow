import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { Injectable } from '@nestjs/common';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetWalletBalanceArgs {
  id?: number;
}

interface WalletBalanceResult {
  id: number;
  name: string;
  totalExpenses: number;
  totalEarnings: number;
  balance: number;
}

@Injectable()
export class GetWalletBalanceTool implements Tool<
  GetWalletBalanceArgs,
  WalletBalanceResult[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getWalletBalance';

  readonly description: string =
    'Returns the balance (expenses, earnings, and net) for all wallets or a specific wallet by ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description:
          'Optional wallet ID. If omitted, returns balances for all wallets',
      },
    },
    required: [],
  };

  async execute(
    profileId: number,
    args: GetWalletBalanceArgs,
  ): Promise<WalletBalanceResult[]> {
    return await this.financialToolsService.getWalletBalance(
      profileId,
      args.id,
    );
  }
}

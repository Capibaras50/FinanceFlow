import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetWalletByNameArgs {
  name: string;
}

@Injectable()
export class GetWalletByNameTool implements Tool<GetWalletByNameArgs, number> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getWalletByName';

  readonly description: string =
    'Returns the wallet ID whose name includes the given text';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Full or partial wallet name to search for',
      },
    },
    required: ['name'],
  };

  async execute(profileId: number, args: GetWalletByNameArgs): Promise<number> {
    return await this.financialToolsService.getWalletByName(
      args.name,
      profileId,
    );
  }
}

import { TopCategoriesInterface } from 'src/transactions/interfaces/top-categories.interface';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetTopCategoriesArgs {
  take: number;
}

@Injectable()
export class GetTopCategoriesTool implements Tool<
  GetTopCategoriesArgs,
  TopCategoriesInterface[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getTopCategories';

  readonly description: string =
    'Returns the top spending categories ranked by total expense value';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      take: {
        type: 'number',
        description: 'Number of top categories to return',
      },
    },
    required: ['take'],
  };

  async execute(
    profileId: number,
    args: GetTopCategoriesArgs,
  ): Promise<TopCategoriesInterface[]> {
    return await this.financialToolsService.getTopCategories(
      profileId,
      args.take,
    );
  }
}

import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { Injectable } from '@nestjs/common';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetCategoryByNameArgs {
  name: string;
}

@Injectable()
export class GetCategoryByNameTool implements Tool<
  GetCategoryByNameArgs,
  number[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getCategoryByName';

  readonly description: string =
    'Returns categories whose name includes the given text';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Full or partial category name to search for',
      },
    },
    required: ['name'],
  };

  async execute(
    profileId: number,
    args: GetCategoryByNameArgs,
  ): Promise<number[]> {
    return await this.financialToolsService.getCategoryByName(
      args.name,
      profileId,
    );
  }
}

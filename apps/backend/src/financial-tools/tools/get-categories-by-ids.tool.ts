import { Category } from 'src/categories/entities/category.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetCategoriesByIdsArgs {
  ids: number[];
}

@Injectable()
export class GetCategoriesByIdsTool implements Tool<
  GetCategoriesByIdsArgs,
  Category[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getCategoriesByIds';

  readonly description: string =
    'Returns One Category For Each Id Of the Array In The Args';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      ids: {
        type: 'array',
        description: 'An array of category IDs to retrieve',
        items: { type: 'number' },
      },
    },
    required: ['ids'],
  };

  async execute(
    profileId: number,
    args: GetCategoriesByIdsArgs,
  ): Promise<Category[]> {
    return await this.financialToolsService.getCategoriesByIds(
      args.ids,
      profileId,
    );
  }
}

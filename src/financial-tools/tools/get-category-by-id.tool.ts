import { Category } from 'src/categories/entities/category.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetCategoryByIdArgs {
  id: number;
}

@Injectable()
export class GetCategoryByIdTool implements Tool<
  GetCategoryByIdArgs,
  Category
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getCategoryById';

  readonly description: string =
    'Returns a category of the authenticated user by its ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the category to retrieve',
      },
    },
    required: ['id'],
  };

  async execute(
    profileId: number,
    args: GetCategoryByIdArgs,
  ): Promise<Category> {
    return await this.financialToolsService.getCategoryById(args.id, profileId);
  }
}

import { Category } from 'src/categories/entities/category.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetAllCategoriesArgs {
  limit?: number;
  page?: number;
}

@Injectable()
export class GetAllCategoriesTool implements Tool<
  GetAllCategoriesArgs,
  Category[]
> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllCategories';

  readonly description: string =
    'Returns all categories of the authenticated user, you can use pagination.';

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
    args: GetAllCategoriesArgs,
  ): Promise<Category[]> {
    return await this.financialToolsService.getAllCategories(
      profileId,
      args.limit,
      args.page,
    );
  }
}

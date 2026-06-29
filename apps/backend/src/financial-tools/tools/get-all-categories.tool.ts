import { Category } from 'src/categories/entities/category.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

@Injectable()
export class GetAllCategoriesTool implements Tool<void, Category[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllCategories';

  readonly description: string =
    'Returns all categories of the authenticated user.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {},
    required: [],
  };

  async execute(profileId: number): Promise<Category[]> {
    return await this.financialToolsService.getAllCategories(profileId);
  }
}

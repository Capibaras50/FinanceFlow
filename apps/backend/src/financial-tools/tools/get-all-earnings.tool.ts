import { Earning } from 'src/transactions/entities/earning.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

@Injectable()
export class GetAllEarningsTool implements Tool<void, Earning[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllEarnings';

  readonly description: string =
    'Returns all earnings of the authenticated user.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {},
    required: [],
  };

  async execute(profileId: number): Promise<Earning[]> {
    return await this.financialToolsService.getAllEarnings(profileId);
  }
}

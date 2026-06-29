import { Earning } from 'src/transactions/entities/earning.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetEarningByIdArgs {
  id: number;
}

@Injectable()
export class GetEarningByIdTool implements Tool<GetEarningByIdArgs, Earning> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getEarningById';

  readonly description: string =
    'Returns an earning of the authenticated user by its ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the earning to retrieve',
      },
    },
    required: ['id'],
  };

  async execute(profileId: number, args: GetEarningByIdArgs): Promise<Earning> {
    return await this.financialToolsService.getEarningById(args.id, profileId);
  }
}

import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
import { Earning } from 'src/transactions/entities/earning.entity';
import { CreateEarningDto } from 'src/transactions/dto/create-earning.dto';

interface CreateEarningArgs {
  name: string;
  description?: string;
  value: number;
  createdAt?: string;
}

@Injectable()
export class CreateEarningTool implements Tool<CreateEarningArgs, Earning> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'createEarning';

  readonly description: string =
    'Create a new earning in the db and return the earning saved. The category and wallet are inferred automatically from the transaction name.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of Earning that user insert.',
      },
      description: {
        type: 'string',
        description:
          'Description of Earning that user insert or you infer of the earning',
      },
      value: {
        type: 'number',
        description: 'Cost of Earning that user insert',
      },
      createdAt: {
        type: 'string',
        description:
          'The date in ISO 8601 format (e.g. 2026-07-13T15:00:00Z) to insert the expense. Only use if the user specifies a date but if the user put today for example you dont put this option.',
      },
    },
    required: ['name', 'value'],
  };

  async execute(profileId: number, args: CreateEarningArgs): Promise<Earning> {
    const categoryId =
      await this.financialToolsService.inferBestCategoryTransaction(
        profileId,
        args.name,
      );
    const walletId =
      await this.financialToolsService.inferBestWalletTransaction(
        profileId,
        args.name,
      );
    const newEarning: CreateEarningDto = {
      name: args.name,
      description: args.description ? args.description : undefined,
      value: args.value,
      walletId,
      categoriesId: [categoryId],
      createdAt: args.createdAt ? new Date(args.createdAt) : undefined,
    };
    return await this.financialToolsService.createEarning(
      profileId,
      newEarning,
    );
  }
}

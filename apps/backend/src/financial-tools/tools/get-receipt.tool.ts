import { Receipt } from 'src/transactions/entities/receipt.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

interface GetReceiptArgs {
  id: number;
}

@Injectable()
export class GetReceiptTool implements Tool<GetReceiptArgs, Receipt> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getReceipt';

  readonly description: string =
    'Returns a receipt of the authenticated user by its ID';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the receipt to retrieve',
      },
    },
    required: ['id'],
  };

  async execute(profileId: number, args: GetReceiptArgs): Promise<Receipt> {
    return await this.financialToolsService.getReceipt(args.id, profileId);
  }
}

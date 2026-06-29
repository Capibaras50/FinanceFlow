import { Receipt } from 'src/transactions/entities/receipt.entity';
import { Injectable } from '@nestjs/common';
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';

@Injectable()
export class GetAllReceiptsTool implements Tool<void, Receipt[]> {
  constructor(private readonly financialToolsService: FinancialToolsService) {}

  readonly name: string = 'getAllReceipts';

  readonly description: string =
    'Returns all receipts of the authenticated user.';

  readonly parameters: ToolParameters = {
    type: 'object',
    properties: {},
    required: [],
  };

  async execute(profileId: number): Promise<Receipt[]> {
    return await this.financialToolsService.getAllReceipts(profileId);
  }
}

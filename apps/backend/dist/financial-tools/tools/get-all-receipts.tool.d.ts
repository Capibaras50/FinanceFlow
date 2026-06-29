import { Receipt } from "../../transactions/entities/receipt.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
export declare class GetAllReceiptsTool implements Tool<void, Receipt[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number): Promise<Receipt[]>;
}

import { Receipt } from "../../transactions/entities/receipt.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetReceiptArgs {
    id: number;
}
export declare class GetReceiptTool implements Tool<GetReceiptArgs, Receipt> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetReceiptArgs): Promise<Receipt>;
}
export {};

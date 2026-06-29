import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetWalletByNameArgs {
    name: string;
}
export declare class GetWalletByNameTool implements Tool<GetWalletByNameArgs, number> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetWalletByNameArgs): Promise<number>;
}
export {};

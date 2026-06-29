import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetWalletBalanceArgs {
    id?: number;
}
interface WalletBalanceResult {
    id: number;
    name: string;
    totalExpenses: number;
    totalEarnings: number;
    balance: number;
}
export declare class GetWalletBalanceTool implements Tool<GetWalletBalanceArgs, WalletBalanceResult[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetWalletBalanceArgs): Promise<WalletBalanceResult[]>;
}
export {};

import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetMonthlySummaryArgs {
    month: number;
}
interface MonthlySummaryResult {
    totalExpenses: string | undefined;
    totalEarnings: string | undefined;
    balance: number;
    numExpenses: string | undefined;
    numEarnings: string | undefined;
    numTransactions: number;
}
export declare class GetMonthlySummaryTool implements Tool<GetMonthlySummaryArgs, MonthlySummaryResult> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetMonthlySummaryArgs): Promise<MonthlySummaryResult>;
}
export {};

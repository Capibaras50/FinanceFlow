import { Expense } from "../../transactions/entities/expense.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetExpensesByDateRangeArgs {
    startDate: string;
    endDate: string;
}
export declare class GetExpensesByDateRangeTool implements Tool<GetExpensesByDateRangeArgs, Expense[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetExpensesByDateRangeArgs): Promise<Expense[]>;
}
export {};

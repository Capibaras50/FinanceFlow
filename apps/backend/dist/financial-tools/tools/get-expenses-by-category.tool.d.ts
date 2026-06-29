import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetExpensesByCategoryArgs {
    categoryIds: number[];
}
interface ExpensesByCategoryResult {
    expenses: import('src/transactions/entities/expense.entity').Expense[];
    totalExpenses: number;
    addition: number | null;
}
export declare class GetExpensesByCategoryTool implements Tool<GetExpensesByCategoryArgs, ExpensesByCategoryResult> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetExpensesByCategoryArgs): Promise<ExpensesByCategoryResult>;
}
export {};

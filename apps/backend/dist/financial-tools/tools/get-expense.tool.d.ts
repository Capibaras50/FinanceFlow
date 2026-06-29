import { Expense } from "../../transactions/entities/expense.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetExpenseArgs {
    id: number;
}
export declare class GetExpenseTool implements Tool<GetExpenseArgs, Expense> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetExpenseArgs): Promise<Expense>;
}
export {};

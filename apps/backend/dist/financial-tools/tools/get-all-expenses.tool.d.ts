import { Expense } from "../../transactions/entities/expense.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
export declare class GetAllExpensesTool implements Tool<void, Expense[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number): Promise<Expense[]>;
}

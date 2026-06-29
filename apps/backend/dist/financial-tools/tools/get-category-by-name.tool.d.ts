import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetCategoryByNameArgs {
    name: string;
}
export declare class GetCategoryByNameTool implements Tool<GetCategoryByNameArgs, number[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetCategoryByNameArgs): Promise<number[]>;
}
export {};

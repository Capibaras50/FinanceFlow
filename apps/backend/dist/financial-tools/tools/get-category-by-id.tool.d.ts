import { Category } from "../../categories/entities/category.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetCategoryByIdArgs {
    id: number;
}
export declare class GetCategoryByIdTool implements Tool<GetCategoryByIdArgs, Category> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetCategoryByIdArgs): Promise<Category>;
}
export {};

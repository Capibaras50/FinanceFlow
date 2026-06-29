import { Category } from "../../categories/entities/category.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetCategoriesByIdsArgs {
    ids: number[];
}
export declare class GetCategoriesByIdsTool implements Tool<GetCategoriesByIdsArgs, Category[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetCategoriesByIdsArgs): Promise<Category[]>;
}
export {};

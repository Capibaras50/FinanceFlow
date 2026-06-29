import { TopCategoriesInterface } from "../../transactions/interfaces/top-categories.interface";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetTopCategoriesArgs {
    take: number;
}
export declare class GetTopCategoriesTool implements Tool<GetTopCategoriesArgs, TopCategoriesInterface[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetTopCategoriesArgs): Promise<TopCategoriesInterface[]>;
}
export {};

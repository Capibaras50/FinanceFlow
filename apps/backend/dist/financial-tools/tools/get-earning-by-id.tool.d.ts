import { Earning } from "../../transactions/entities/earning.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetEarningByIdArgs {
    id: number;
}
export declare class GetEarningByIdTool implements Tool<GetEarningByIdArgs, Earning> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetEarningByIdArgs): Promise<Earning>;
}
export {};

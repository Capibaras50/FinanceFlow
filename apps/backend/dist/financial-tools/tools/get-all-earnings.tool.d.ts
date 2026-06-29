import { Earning } from "../../transactions/entities/earning.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
export declare class GetAllEarningsTool implements Tool<void, Earning[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number): Promise<Earning[]>;
}

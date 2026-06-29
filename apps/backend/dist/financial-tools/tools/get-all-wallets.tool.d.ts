import { Wallet } from "../../wallets/entities/wallets.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
export declare class GetAllWalletsTool implements Tool<void, Wallet[]> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number): Promise<Wallet[]>;
}

import { Wallet } from "../../wallets/entities/wallets.entity";
import { Tool, ToolParameters } from '../interfaces/tool.interface';
import { FinancialToolsService } from '../services/financial-tools.service';
interface GetWalletArgs {
    id: number;
}
export declare class GetWalletTool implements Tool<GetWalletArgs, Wallet> {
    private readonly financialToolsService;
    constructor(financialToolsService: FinancialToolsService);
    readonly name: string;
    readonly description: string;
    readonly parameters: ToolParameters;
    execute(profileId: number, args: GetWalletArgs): Promise<Wallet>;
}
export {};

import { GetAllCategoriesTool } from '../tools/get-all-categories.tool';
import { GetAllEarningsTool } from '../tools/get-all-earnings.tool';
import { GetAllExpensesTool } from '../tools/get-all-expenses.tool';
import { GetAllReceiptsTool } from '../tools/get-all-receipts.tool';
import { GetAllWalletsTool } from '../tools/get-all-wallets.tool';
import { GetCategoriesByIdsTool } from '../tools/get-categories-by-ids.tool';
import { GetCategoryByIdTool } from '../tools/get-category-by-id.tool';
import { GetCategoryByNameTool } from '../tools/get-category-by-name.tool';
import { GetEarningByIdTool } from '../tools/get-earning-by-id.tool';
import { GetExpenseTool } from '../tools/get-expense.tool';
import { GetExpensesByCategoryTool } from '../tools/get-expenses-by-category.tool';
import { GetExpensesByDateRangeTool } from '../tools/get-expenses-by-date-range.tool';
import { GetMonthlySummaryTool } from '../tools/get-monthly-summary.tool';
import { GetReceiptTool } from '../tools/get-receipt.tool';
import { GetTopCategoriesTool } from '../tools/get-top-categories.tool';
import { GetWalletBalanceTool } from '../tools/get-wallet-balance.tool';
import { GetWalletByNameTool } from '../tools/get-wallet-by-name.tool';
import { GetWalletTool } from '../tools/get-wallet.tool';
import { ToolParameters } from '../interfaces/tool.interface';
interface OpenAiToolDefinition {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: ToolParameters;
    };
}
export declare class ToolRegistryService {
    private readonly toolsRegistry;
    constructor(getAllCategories: GetAllCategoriesTool, getAllEarnings: GetAllEarningsTool, getAllExpenses: GetAllExpensesTool, getAllReceipts: GetAllReceiptsTool, getAllWallets: GetAllWalletsTool, getCategoriesByIds: GetCategoriesByIdsTool, getCategoryById: GetCategoryByIdTool, getCategoryByName: GetCategoryByNameTool, getEarningById: GetEarningByIdTool, getExpense: GetExpenseTool, getExpensesByCategory: GetExpensesByCategoryTool, getExpensesByDateRange: GetExpensesByDateRangeTool, getMonthlySummary: GetMonthlySummaryTool, getReceipt: GetReceiptTool, getTopCategories: GetTopCategoriesTool, getWalletBalance: GetWalletBalanceTool, getWalletByName: GetWalletByNameTool, getWallet: GetWalletTool);
    getTools(): OpenAiToolDefinition[];
    executeTool(toolName: string, profileId: number, args: Record<string, unknown>): Promise<unknown>;
}
export {};

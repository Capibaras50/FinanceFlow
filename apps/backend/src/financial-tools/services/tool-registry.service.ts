import { Injectable } from '@nestjs/common';
import { Tool } from '../interfaces/tool.interface';
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
import { CreateExpenseTool } from '../tools/create-expense.tool';
import { CreateEarningTool } from '../tools/create-earning.tool';

interface OpenAiToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: ToolParameters;
  };
}

@Injectable()
export class ToolRegistryService {
  private readonly toolsRegistry: Tool<any, any>[];

  constructor(
    getAllCategories: GetAllCategoriesTool,
    getAllEarnings: GetAllEarningsTool,
    getAllExpenses: GetAllExpensesTool,
    getAllReceipts: GetAllReceiptsTool,
    getAllWallets: GetAllWalletsTool,
    getCategoriesByIds: GetCategoriesByIdsTool,
    getCategoryById: GetCategoryByIdTool,
    getCategoryByName: GetCategoryByNameTool,
    getEarningById: GetEarningByIdTool,
    getExpense: GetExpenseTool,
    getExpensesByCategory: GetExpensesByCategoryTool,
    getExpensesByDateRange: GetExpensesByDateRangeTool,
    getMonthlySummary: GetMonthlySummaryTool,
    getReceipt: GetReceiptTool,
    getTopCategories: GetTopCategoriesTool,
    getWalletBalance: GetWalletBalanceTool,
    getWalletByName: GetWalletByNameTool,
    getWallet: GetWalletTool,
    createEarning: CreateEarningTool,
    createExpense: CreateExpenseTool,
  ) {
    this.toolsRegistry = [
      getAllCategories,
      getAllEarnings,
      getAllExpenses,
      getAllReceipts,
      getAllWallets,
      getCategoriesByIds,
      getCategoryById,
      getCategoryByName,
      getEarningById,
      getExpense,
      getExpensesByCategory,
      getExpensesByDateRange,
      getMonthlySummary,
      getReceipt,
      getTopCategories,
      getWalletBalance,
      getWalletByName,
      getWallet,
      createExpense,
      createEarning,
    ];
  }

  getTools(): OpenAiToolDefinition[] {
    return this.toolsRegistry.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async executeTool(
    toolName: string,
    profileId: number,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    const tool = this.toolsRegistry.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }
    return await tool.execute(profileId, args);
  }
}

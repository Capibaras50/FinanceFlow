"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolRegistryService = void 0;
const common_1 = require("@nestjs/common");
const get_all_categories_tool_1 = require("../tools/get-all-categories.tool");
const get_all_earnings_tool_1 = require("../tools/get-all-earnings.tool");
const get_all_expenses_tool_1 = require("../tools/get-all-expenses.tool");
const get_all_receipts_tool_1 = require("../tools/get-all-receipts.tool");
const get_all_wallets_tool_1 = require("../tools/get-all-wallets.tool");
const get_categories_by_ids_tool_1 = require("../tools/get-categories-by-ids.tool");
const get_category_by_id_tool_1 = require("../tools/get-category-by-id.tool");
const get_category_by_name_tool_1 = require("../tools/get-category-by-name.tool");
const get_earning_by_id_tool_1 = require("../tools/get-earning-by-id.tool");
const get_expense_tool_1 = require("../tools/get-expense.tool");
const get_expenses_by_category_tool_1 = require("../tools/get-expenses-by-category.tool");
const get_expenses_by_date_range_tool_1 = require("../tools/get-expenses-by-date-range.tool");
const get_monthly_summary_tool_1 = require("../tools/get-monthly-summary.tool");
const get_receipt_tool_1 = require("../tools/get-receipt.tool");
const get_top_categories_tool_1 = require("../tools/get-top-categories.tool");
const get_wallet_balance_tool_1 = require("../tools/get-wallet-balance.tool");
const get_wallet_by_name_tool_1 = require("../tools/get-wallet-by-name.tool");
const get_wallet_tool_1 = require("../tools/get-wallet.tool");
let ToolRegistryService = class ToolRegistryService {
    toolsRegistry;
    constructor(getAllCategories, getAllEarnings, getAllExpenses, getAllReceipts, getAllWallets, getCategoriesByIds, getCategoryById, getCategoryByName, getEarningById, getExpense, getExpensesByCategory, getExpensesByDateRange, getMonthlySummary, getReceipt, getTopCategories, getWalletBalance, getWalletByName, getWallet) {
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
        ];
    }
    getTools() {
        return this.toolsRegistry.map((tool) => ({
            type: 'function',
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
            },
        }));
    }
    async executeTool(toolName, profileId, args) {
        const tool = this.toolsRegistry.find((t) => t.name === toolName);
        if (!tool) {
            throw new Error(`Tool "${toolName}" not found`);
        }
        return await tool.execute(profileId, args);
    }
};
exports.ToolRegistryService = ToolRegistryService;
exports.ToolRegistryService = ToolRegistryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [get_all_categories_tool_1.GetAllCategoriesTool,
        get_all_earnings_tool_1.GetAllEarningsTool,
        get_all_expenses_tool_1.GetAllExpensesTool,
        get_all_receipts_tool_1.GetAllReceiptsTool,
        get_all_wallets_tool_1.GetAllWalletsTool,
        get_categories_by_ids_tool_1.GetCategoriesByIdsTool,
        get_category_by_id_tool_1.GetCategoryByIdTool,
        get_category_by_name_tool_1.GetCategoryByNameTool,
        get_earning_by_id_tool_1.GetEarningByIdTool,
        get_expense_tool_1.GetExpenseTool,
        get_expenses_by_category_tool_1.GetExpensesByCategoryTool,
        get_expenses_by_date_range_tool_1.GetExpensesByDateRangeTool,
        get_monthly_summary_tool_1.GetMonthlySummaryTool,
        get_receipt_tool_1.GetReceiptTool,
        get_top_categories_tool_1.GetTopCategoriesTool,
        get_wallet_balance_tool_1.GetWalletBalanceTool,
        get_wallet_by_name_tool_1.GetWalletByNameTool,
        get_wallet_tool_1.GetWalletTool])
], ToolRegistryService);
//# sourceMappingURL=tool-registry.service.js.map
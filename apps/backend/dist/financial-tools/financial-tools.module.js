"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialToolsModule = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("./services/financial-tools.service");
const tool_registry_service_1 = require("./services/tool-registry.service");
const get_all_categories_tool_1 = require("./tools/get-all-categories.tool");
const get_all_earnings_tool_1 = require("./tools/get-all-earnings.tool");
const get_all_expenses_tool_1 = require("./tools/get-all-expenses.tool");
const get_all_receipts_tool_1 = require("./tools/get-all-receipts.tool");
const get_all_wallets_tool_1 = require("./tools/get-all-wallets.tool");
const get_categories_by_ids_tool_1 = require("./tools/get-categories-by-ids.tool");
const get_category_by_id_tool_1 = require("./tools/get-category-by-id.tool");
const get_category_by_name_tool_1 = require("./tools/get-category-by-name.tool");
const get_earning_by_id_tool_1 = require("./tools/get-earning-by-id.tool");
const get_expense_tool_1 = require("./tools/get-expense.tool");
const get_expenses_by_category_tool_1 = require("./tools/get-expenses-by-category.tool");
const get_expenses_by_date_range_tool_1 = require("./tools/get-expenses-by-date-range.tool");
const get_monthly_summary_tool_1 = require("./tools/get-monthly-summary.tool");
const get_receipt_tool_1 = require("./tools/get-receipt.tool");
const get_top_categories_tool_1 = require("./tools/get-top-categories.tool");
const get_wallet_balance_tool_1 = require("./tools/get-wallet-balance.tool");
const get_wallet_by_name_tool_1 = require("./tools/get-wallet-by-name.tool");
const get_wallet_tool_1 = require("./tools/get-wallet.tool");
const transactions_base_module_1 = require("../transactions/transactions-base.module");
const wallets_module_1 = require("../wallets/wallets.module");
const categories_module_1 = require("../categories/categories.module");
let FinancialToolsModule = class FinancialToolsModule {
};
exports.FinancialToolsModule = FinancialToolsModule;
exports.FinancialToolsModule = FinancialToolsModule = __decorate([
    (0, common_1.Module)({
        imports: [transactions_base_module_1.TransactionsBaseModule, wallets_module_1.WalletsModule, categories_module_1.CategoriesModule],
        providers: [
            financial_tools_service_1.FinancialToolsService,
            tool_registry_service_1.ToolRegistryService,
            get_all_categories_tool_1.GetAllCategoriesTool,
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
            get_wallet_tool_1.GetWalletTool,
        ],
        exports: [tool_registry_service_1.ToolRegistryService],
    })
], FinancialToolsModule);
//# sourceMappingURL=financial-tools.module.js.map
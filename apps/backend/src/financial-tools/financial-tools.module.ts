import { Module } from '@nestjs/common';
import { FinancialToolsService } from './services/financial-tools.service';
import { ToolRegistryService } from './services/tool-registry.service';
import { GetAllCategoriesTool } from './tools/get-all-categories.tool';
import { GetAllEarningsTool } from './tools/get-all-earnings.tool';
import { GetAllExpensesTool } from './tools/get-all-expenses.tool';
import { GetAllReceiptsTool } from './tools/get-all-receipts.tool';
import { GetAllWalletsTool } from './tools/get-all-wallets.tool';
import { GetCategoriesByIdsTool } from './tools/get-categories-by-ids.tool';
import { GetCategoryByIdTool } from './tools/get-category-by-id.tool';
import { GetCategoryByNameTool } from './tools/get-category-by-name.tool';
import { GetEarningByIdTool } from './tools/get-earning-by-id.tool';
import { GetExpenseTool } from './tools/get-expense.tool';
import { GetExpensesByCategoryTool } from './tools/get-expenses-by-category.tool';
import { GetExpensesByDateRangeTool } from './tools/get-expenses-by-date-range.tool';
import { GetMonthlySummaryTool } from './tools/get-monthly-summary.tool';
import { GetReceiptTool } from './tools/get-receipt.tool';
import { GetTopCategoriesTool } from './tools/get-top-categories.tool';
import { GetWalletBalanceTool } from './tools/get-wallet-balance.tool';
import { GetWalletByNameTool } from './tools/get-wallet-by-name.tool';
import { GetWalletTool } from './tools/get-wallet.tool';
import { TransactionsBaseModule } from 'src/transactions/transactions-base.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { CategoriesModule } from 'src/categories/categories.module';
import { CreateExpenseTool } from './tools/create-expense.tool';
import { CreateEarningTool } from './tools/create-earning.tool';
import { TransactionInferenceModule } from 'src/transaction-inference/transaction-inference.module';

@Module({
  imports: [
    TransactionsBaseModule,
    WalletsModule,
    CategoriesModule,
    TransactionInferenceModule,
  ],
  providers: [
    FinancialToolsService,
    ToolRegistryService,
    GetAllCategoriesTool,
    GetAllEarningsTool,
    GetAllExpensesTool,
    GetAllReceiptsTool,
    GetAllWalletsTool,
    GetCategoriesByIdsTool,
    GetCategoryByIdTool,
    GetCategoryByNameTool,
    GetEarningByIdTool,
    GetExpenseTool,
    GetExpensesByCategoryTool,
    GetExpensesByDateRangeTool,
    GetMonthlySummaryTool,
    GetReceiptTool,
    GetTopCategoriesTool,
    GetWalletBalanceTool,
    GetWalletByNameTool,
    GetWalletTool,
    CreateExpenseTool,
    CreateEarningTool,
  ],
  exports: [ToolRegistryService],
})
export class FinancialToolsModule {}

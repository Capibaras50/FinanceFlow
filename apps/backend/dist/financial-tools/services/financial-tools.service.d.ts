import { CategoriesService } from "../../categories/services/categories.service";
import { EarningService } from "../../transactions/services/earning.service";
import { ExpenseService } from "../../transactions/services/expense.service";
import { ReceiptService } from "../../transactions/services/receipt.service";
import { WalletsService } from "../../wallets/services/wallets.service";
export declare class FinancialToolsService {
    private categoriesService;
    private walletsService;
    private receiptService;
    private expenseService;
    private earningService;
    constructor(categoriesService: CategoriesService, walletsService: WalletsService, receiptService: ReceiptService, expenseService: ExpenseService, earningService: EarningService);
    getAllCategories(profileId: number): Promise<import("../../categories/entities/category.entity").Category[]>;
    getCategoryById(id: number, profileId: number): Promise<import("../../categories/entities/category.entity").Category>;
    getCategoriesByIds(categoriesIds: number[], profileId: number): Promise<import("../../categories/entities/category.entity").Category[]>;
    getCategoryByName(name: string, profileId: number): Promise<number[]>;
    getAllReceipts(profileId: number): Promise<import("../../transactions/entities/receipt.entity").Receipt[]>;
    getReceipt(id: number, profileId: number): Promise<import("../../transactions/entities/receipt.entity").Receipt>;
    getAllExpenses(profileId: number): Promise<import("../../transactions/entities/expense.entity").Expense[]>;
    getExpense(id: number, profileId: number): Promise<import("../../transactions/entities/expense.entity").Expense>;
    getExpensesByCategory(categoriesIds: number[], profileId: number): Promise<{
        expenses: import("../../transactions/entities/expense.entity").Expense[];
        totalExpenses: number;
        addition: number | null;
    }>;
    getExpensesByDateRange(startDate: Date, endDate: Date, profileId: number): Promise<import("../../transactions/entities/expense.entity").Expense[]>;
    getTopCategories(profileId: number, take: number): Promise<import("../../transactions/interfaces/top-categories.interface").TopCategoriesInterface[]>;
    getAllWallets(profileId: number): Promise<import("../../wallets/entities/wallets.entity").Wallet[]>;
    getWallet(id: number, profileId: number): Promise<import("../../wallets/entities/wallets.entity").Wallet>;
    getWalletByName(name: string, profileId: number): Promise<number>;
    getWalletBalance(profileId: number, id?: number): Promise<{
        id: number;
        name: string;
        totalExpenses: number;
        totalEarnings: number;
        balance: number;
    }[]>;
    getMonthlySummary(profileId: number, month: number): Promise<{
        totalExpenses: string | undefined;
        totalEarnings: string | undefined;
        balance: number;
        numExpenses: string | undefined;
        numEarnings: string | undefined;
        numTransactions: number;
    }>;
    getAllEarnings(profileId: number): Promise<import("../../transactions/entities/earning.entity").Earning[]>;
    getEarningById(id: number, profileId: number): Promise<import("../../transactions/entities/earning.entity").Earning>;
}

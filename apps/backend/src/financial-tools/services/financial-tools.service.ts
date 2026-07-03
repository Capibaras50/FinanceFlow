import { Injectable } from '@nestjs/common';
import { CategoriesService } from 'src/categories/services/categories.service';
import { FilterTransactionDto } from 'src/transactions/dto/filter-transaction.dto';
import { EarningService } from 'src/transactions/services/earning.service';
import { ExpenseService } from 'src/transactions/services/expense.service';
import { ReceiptService } from 'src/transactions/services/receipt.service';
import { WalletsService } from 'src/wallets/services/wallets.service';

@Injectable()
export class FinancialToolsService {
  constructor(
    private categoriesService: CategoriesService,
    private walletsService: WalletsService,
    private receiptService: ReceiptService,
    private expenseService: ExpenseService,
    private earningService: EarningService,
  ) {}

  // CATEGORIES
  async getAllCategories(profileId: number) {
    return await this.categoriesService.findAll(profileId);
  }

  async getCategoryById(id: number, profileId: number) {
    return await this.categoriesService.findOne(id, profileId);
  }

  async getCategoriesByIds(categoriesIds: number[], profileId: number) {
    return await this.categoriesService.findByIds(categoriesIds, profileId);
  }

  async getCategoryByName(name: string, profileId: number) {
    return await this.categoriesService.findByName(name, profileId);
  }

  // RECEIPTS
  async getAllReceipts(profileId: number) {
    return await this.receiptService.findAll(profileId);
  }

  async getReceipt(id: number, profileId: number) {
    return await this.receiptService.findOne(id, profileId);
  }

  // EXPENSES
  async getAllExpenses(
    profileId: number,
    filterTransactionDto: FilterTransactionDto,
  ) {
    return await this.expenseService.findAll(profileId, filterTransactionDto);
  }

  async getExpense(id: number, profileId: number) {
    return await this.expenseService.findOne(id, profileId);
  }

  async getExpensesByCategory(categoriesIds: number[], profileId: number) {
    return await this.expenseService.findExpensesByCategory(
      categoriesIds,
      profileId,
    );
  }

  async getExpensesByDateRange(
    startDate: Date,
    endDate: Date,
    profileId: number,
  ) {
    return await this.expenseService.findExpensesByDateRange(
      startDate,
      endDate,
      profileId,
    );
  }

  async getTopCategories(profileId: number, take: number) {
    return await this.expenseService.getTopCategories(profileId, take);
  }

  // WALLETS
  async getAllWallets(profileId: number) {
    return await this.walletsService.findAll(profileId);
  }

  async getWallet(id: number, profileId: number) {
    return await this.walletsService.findOne(id, profileId);
  }

  async getWalletByName(name: string, profileId: number) {
    return await this.walletsService.findByName(name, profileId);
  }

  async getWalletBalance(profileId: number, id?: number) {
    return await this.walletsService.getWalletBalance(profileId, id);
  }

  async getMonthlySummary(profileId: number, month: number) {
    const expenses = await this.expenseService.getTotalExpenses(
      profileId,
      month,
    );
    const earnings = await this.earningService.getTotalEarnings(
      profileId,
      month,
    );
    const balance =
      Number(earnings?.totalEarnings) - Number(expenses?.totalExpenses);
    const numTransactions =
      Number(earnings?.numEarnings) + Number(expenses?.numExpenses);
    return {
      totalExpenses: expenses?.totalExpenses,
      totalEarnings: earnings?.totalEarnings,
      balance,
      numExpenses: expenses?.numExpenses,
      numEarnings: earnings?.numEarnings,
      numTransactions,
    };
  }

  // EARNINGS
  async getAllEarnings(
    profileId: number,
    filterTransactionDto: FilterTransactionDto,
  ) {
    return await this.earningService.findAll(profileId, filterTransactionDto);
  }

  async getEarningById(id: number, profileId: number) {
    return await this.earningService.findOne(id, profileId);
  }
}

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
exports.FinancialToolsService = void 0;
const common_1 = require("@nestjs/common");
const categories_service_1 = require("../../categories/services/categories.service");
const earning_service_1 = require("../../transactions/services/earning.service");
const expense_service_1 = require("../../transactions/services/expense.service");
const receipt_service_1 = require("../../transactions/services/receipt.service");
const wallets_service_1 = require("../../wallets/services/wallets.service");
let FinancialToolsService = class FinancialToolsService {
    categoriesService;
    walletsService;
    receiptService;
    expenseService;
    earningService;
    constructor(categoriesService, walletsService, receiptService, expenseService, earningService) {
        this.categoriesService = categoriesService;
        this.walletsService = walletsService;
        this.receiptService = receiptService;
        this.expenseService = expenseService;
        this.earningService = earningService;
    }
    async getAllCategories(profileId) {
        return await this.categoriesService.findAll(profileId);
    }
    async getCategoryById(id, profileId) {
        return await this.categoriesService.findOne(id, profileId);
    }
    async getCategoriesByIds(categoriesIds, profileId) {
        return await this.categoriesService.findByIds(categoriesIds, profileId);
    }
    async getCategoryByName(name, profileId) {
        return await this.categoriesService.findByName(name, profileId);
    }
    async getAllReceipts(profileId) {
        return await this.receiptService.findAll(profileId);
    }
    async getReceipt(id, profileId) {
        return await this.receiptService.findOne(id, profileId);
    }
    async getAllExpenses(profileId) {
        return await this.expenseService.findAll(profileId);
    }
    async getExpense(id, profileId) {
        return await this.expenseService.findOne(id, profileId);
    }
    async getExpensesByCategory(categoriesIds, profileId) {
        return await this.expenseService.findExpensesByCategory(categoriesIds, profileId);
    }
    async getExpensesByDateRange(startDate, endDate, profileId) {
        return await this.expenseService.findExpensesByDateRange(startDate, endDate, profileId);
    }
    async getTopCategories(profileId, take) {
        return await this.expenseService.getTopCategories(profileId, take);
    }
    async getAllWallets(profileId) {
        return await this.walletsService.findAll(profileId);
    }
    async getWallet(id, profileId) {
        return await this.walletsService.findOne(id, profileId);
    }
    async getWalletByName(name, profileId) {
        return await this.walletsService.findByName(name, profileId);
    }
    async getWalletBalance(profileId, id) {
        return await this.walletsService.getWalletBalance(profileId, id);
    }
    async getMonthlySummary(profileId, month) {
        const expenses = await this.expenseService.getTotalExpenses(profileId, month);
        const earnings = await this.earningService.getTotalEarnings(profileId, month);
        const balance = Number(earnings?.totalEarnings) - Number(expenses?.totalExpenses);
        const numTransactions = Number(earnings?.numEarnings) + Number(expenses?.numExpenses);
        return {
            totalExpenses: expenses?.totalExpenses,
            totalEarnings: earnings?.totalEarnings,
            balance,
            numExpenses: expenses?.numExpenses,
            numEarnings: earnings?.numEarnings,
            numTransactions,
        };
    }
    async getAllEarnings(profileId) {
        return await this.earningService.findAll(profileId);
    }
    async getEarningById(id, profileId) {
        return await this.earningService.findOne(id, profileId);
    }
};
exports.FinancialToolsService = FinancialToolsService;
exports.FinancialToolsService = FinancialToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService,
        wallets_service_1.WalletsService,
        receipt_service_1.ReceiptService,
        expense_service_1.ExpenseService,
        earning_service_1.EarningService])
], FinancialToolsService);
//# sourceMappingURL=financial-tools.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const expense_entity_1 = require("../entities/expense.entity");
const typeorm_2 = require("@nestjs/typeorm");
const wallets_service_1 = require("../../wallets/services/wallets.service");
const categories_service_1 = require("../../categories/services/categories.service");
const receipt_entity_1 = require("../entities/receipt.entity");
const receipt_enums_1 = require("../enums/receipt.enums");
const receipt_service_1 = require("./receipt.service");
let ExpenseService = class ExpenseService {
    expensesRepository;
    walletsService;
    categoriesService;
    receiptsService;
    dataSource;
    constructor(expensesRepository, walletsService, categoriesService, receiptsService, dataSource) {
        this.expensesRepository = expensesRepository;
        this.walletsService = walletsService;
        this.categoriesService = categoriesService;
        this.receiptsService = receiptsService;
        this.dataSource = dataSource;
    }
    async create(createExpenseDto, profileId) {
        try {
            const wallet = await this.walletsService.findOne(createExpenseDto.walletId, profileId);
            const categories = await this.categoriesService.findByIds(createExpenseDto.categoriesId, profileId);
            const newExpense = {
                name: createExpenseDto.name,
                description: createExpenseDto.description,
                categories,
                profile: { id: profileId },
                wallet: { id: wallet.id },
                value: createExpenseDto.value,
                receipt: createExpenseDto.receiptId
                    ? { id: createExpenseDto.receiptId }
                    : undefined,
            };
            const createdExpense = this.expensesRepository.create(newExpense);
            const savedExpense = await this.expensesRepository.save(createdExpense);
            return savedExpense;
        }
        catch {
            throw new common_1.BadRequestException('The Expense Could Not Be Created');
        }
    }
    async findAll(profileId) {
        const expenses = await this.expensesRepository.find({
            where: {
                profile: { id: profileId },
                deletedAt: undefined,
            },
            relations: ['categories', 'wallet'],
        });
        return expenses;
    }
    async findOne(id, profileId) {
        const expense = await this.expensesRepository.findOne({
            where: {
                id,
                profile: { id: profileId },
                deletedAt: undefined,
            },
            relations: ['categories', 'wallet'],
        });
        if (!expense) {
            throw new common_1.NotFoundException('The Expense Not Found');
        }
        return expense;
    }
    async findExpensesByCategory(categoriesIds, profileId) {
        const [expenses, total] = await this.expensesRepository.findAndCount({
            where: {
                categories: (0, typeorm_1.In)(categoriesIds),
                profile: { id: profileId },
                deletedAt: undefined,
            },
            relations: ['categories', 'wallet'],
        });
        const addition = await this.expensesRepository.sum('value', {
            categories: (0, typeorm_1.In)(categoriesIds),
            profile: { id: profileId },
            deletedAt: undefined,
        });
        return {
            expenses,
            totalExpenses: total,
            addition,
        };
    }
    async findExpensesByDateRange(startDate, endDate, profileId) {
        const expenses = await this.expensesRepository.find({
            where: {
                createdAt: (0, typeorm_1.Between)(startDate, endDate),
                profile: { id: profileId },
            },
            relations: ['categories', 'wallet'],
        });
        return expenses;
    }
    async getTopCategories(profileId, take) {
        const categories = await this.expensesRepository
            .createQueryBuilder('expense')
            .leftJoin('expense.categories', 'category')
            .select('category.id', 'id')
            .addSelect('category.name', 'name')
            .addSelect('SUM(expense.value)', 'total')
            .addSelect('COUNT(expense.id)', 'count')
            .where('expense.profile.id = :profileId', { profileId })
            .groupBy('category.id')
            .addGroupBy('category.name')
            .orderBy({
            'SUM(expense.value)': 'DESC',
        })
            .take(take)
            .getRawMany();
        return categories;
    }
    async getTotalExpenses(profileId, month) {
        const totalExpenses = await this.expensesRepository
            .createQueryBuilder('expenses')
            .select('COALESCE(SUM(expenses.value), 0)', 'totalExpenses')
            .addSelect('COUNT(expenses.id)', 'numExpenses')
            .where('expenses.profile.id = :profileId', { profileId, month })
            .andWhere('EXTRACT(MONTH FROM expenses.createdAt) = :month', { month })
            .andWhere('expenses.deletedAt IS NULL')
            .getRawOne();
        return totalExpenses;
    }
    async update(id, profileId, updateExpenseDto) {
        try {
            const changes = {};
            const expense = await this.findOne(id, profileId);
            if (updateExpenseDto.name !== undefined) {
                changes.name = updateExpenseDto.name;
            }
            if (updateExpenseDto.description !== undefined) {
                changes.description = updateExpenseDto.description;
            }
            if (updateExpenseDto.value !== undefined) {
                changes.value = updateExpenseDto.value;
            }
            if (updateExpenseDto.walletId !== undefined) {
                const wallet = await this.walletsService.findOne(updateExpenseDto.walletId, profileId);
                changes.wallet = { id: wallet.id };
            }
            if (updateExpenseDto.categoriesId !== undefined) {
                const categories = await this.categoriesService.findByIds(updateExpenseDto.categoriesId, profileId);
                changes.categories = categories;
            }
            if (updateExpenseDto.receiptId !== undefined) {
                const receipt = await this.receiptsService.findOne(updateExpenseDto.receiptId, profileId);
                changes.receipt = { id: receipt.id };
            }
            const mergedExpense = this.expensesRepository.merge(expense, changes);
            const savedExpense = await this.expensesRepository.save(mergedExpense);
            return savedExpense;
        }
        catch {
            throw new common_1.BadRequestException('The Expense Could Not Be Updated');
        }
    }
    async createExpenseFromReceipt(nameExpense, descriptionExpense, valueExpense, walletName, categoryName, profileId, fileName, sizeBytes, mimeType, receiptUrl, extractionConfidence, jobId, attempts, lastError) {
        return await this.dataSource
            .transaction(async (manager) => {
            const walletId = await this.walletsService.findByName(walletName, profileId);
            const categoriesId = await this.categoriesService.findByName(categoryName, profileId);
            const newExpense = {
                name: nameExpense,
                description: descriptionExpense,
                value: valueExpense,
                categories: categoriesId.map((id) => ({ id })),
                wallet: { id: walletId },
                receipt: undefined,
                profile: { id: profileId },
            };
            const createdExpense = manager.create(expense_entity_1.Expense, newExpense);
            await manager.save(createdExpense);
            const newReceipt = {
                fileName,
                extractionConfidence,
                fileUrl: receiptUrl,
                fileSizeBytes: sizeBytes,
                mimeType,
                status: receipt_enums_1.ReceiptStatus.PENDING,
                jobId,
                attempts,
                lastError,
                expense: createdExpense,
                profile: { id: profileId },
            };
            const createdReceipt = manager.create(receipt_entity_1.Receipt, newReceipt);
            await manager.save(createdReceipt);
            const mergedExpense = manager.merge(expense_entity_1.Expense, createdExpense, {
                receipt: createdReceipt,
            });
            return await manager.save(mergedExpense);
        })
            .catch(() => {
            throw new common_1.BadRequestException('The Expense Could Not Be Created From Receipt');
        });
    }
    async remove(id, profileId) {
        const expense = await this.findOne(id, profileId);
        const mergedExpense = this.expensesRepository.merge(expense, {
            deletedAt: new Date(),
        });
        const savedExpense = await this.expensesRepository.save(mergedExpense);
        return savedExpense.id;
    }
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        wallets_service_1.WalletsService,
        categories_service_1.CategoriesService,
        receipt_service_1.ReceiptService,
        typeorm_1.DataSource])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map
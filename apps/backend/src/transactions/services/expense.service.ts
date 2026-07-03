import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial, Repository, DataSource, Between, In } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { CategoriesService } from 'src/categories/services/categories.service';
import { Receipt } from '../entities/receipt.entity';
import { ReceiptStatus } from '../enums/receipt.enums';
import { ReceiptService } from './receipt.service';
import { TopCategoriesInterface } from '../interfaces/top-categories.interface';
import { TotalExpensesInterface } from '../interfaces/monthly-summary.interface';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private walletsService: WalletsService,
    private categoriesService: CategoriesService,
    private receiptsService: ReceiptService,
    private dataSource: DataSource,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, profileId: number) {
    try {
      const wallet = await this.walletsService.findOne(
        createExpenseDto.walletId,
        profileId,
      );
      const categories = await this.categoriesService.findByIds(
        createExpenseDto.categoriesId,
        profileId,
      );
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
    } catch {
      throw new BadRequestException('The Expense Could Not Be Created');
    }
  }

  async findAll(profileId: number, filterTransactionDto: FilterTransactionDto) {
    try {
      const order = filterTransactionDto.sortBy
        ? { [filterTransactionDto.sortBy]: filterTransactionDto.sortOrder }
        : {};
      const where = {
        profile: { id: profileId },
        deletedAt: undefined,
      };
      if (filterTransactionDto.category) {
        where['categories'] = { name: filterTransactionDto.category };
      }
      if (filterTransactionDto.wallet) {
        where['wallet'] = { name: filterTransactionDto.wallet };
      }
      const expenses = await this.expensesRepository.find({
        where,
        relations: ['categories', 'wallet'],
        take: filterTransactionDto.limit || 10,
        skip: ((filterTransactionDto.page ?? 1) - 1) * 10,
        order,
      });
      return expenses;
    } catch {
      throw new BadRequestException('Couldnt Get Anyone Expense');
    }
  }

  async findOne(id: number, profileId: number) {
    const expense = await this.expensesRepository.findOne({
      where: {
        id,
        profile: { id: profileId },
        deletedAt: undefined,
      },
      relations: ['categories', 'wallet'],
    });
    if (!expense) {
      throw new NotFoundException('The Expense Not Found');
    }
    return expense;
  }

  async findExpensesByCategory(categoriesIds: number[], profileId: number) {
    const [expenses, total] = await this.expensesRepository.findAndCount({
      where: {
        categories: In(categoriesIds),
        profile: { id: profileId },
        deletedAt: undefined,
      },
      relations: ['categories', 'wallet'],
    });
    const addition = await this.expensesRepository.sum('value', {
      categories: In(categoriesIds),
      profile: { id: profileId },
      deletedAt: undefined,
    });
    return {
      expenses,
      totalExpenses: total,
      addition,
    };
  }

  async findExpensesByDateRange(
    startDate: Date,
    endDate: Date,
    profileId: number,
  ) {
    const expenses = await this.expensesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        profile: { id: profileId },
      },
      relations: ['categories', 'wallet'],
    });
    return expenses;
  }

  async getTopCategories(profileId: number, take: number) {
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
      .getRawMany<TopCategoriesInterface>();

    return categories;
  }

  async getTotalExpenses(profileId: number, month: number) {
    const totalExpenses = await this.expensesRepository
      .createQueryBuilder('expenses')
      .select('COALESCE(SUM(expenses.value), 0)', 'totalExpenses')
      .addSelect('COUNT(expenses.id)', 'numExpenses')
      .where('expenses.profile.id = :profileId', { profileId, month })
      .andWhere('EXTRACT(MONTH FROM expenses.createdAt) = :month', { month })
      .andWhere('expenses.deletedAt IS NULL')
      .getRawOne<TotalExpensesInterface>();
    return totalExpenses;
  }

  async update(
    id: number,
    profileId: number,
    updateExpenseDto: UpdateExpenseDto,
  ) {
    try {
      const changes: DeepPartial<Expense> = {};
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
        const wallet = await this.walletsService.findOne(
          updateExpenseDto.walletId,
          profileId,
        );
        changes.wallet = { id: wallet.id };
      }

      if (updateExpenseDto.categoriesId !== undefined) {
        const categories = await this.categoriesService.findByIds(
          updateExpenseDto.categoriesId,
          profileId,
        );
        changes.categories = categories;
      }

      if (updateExpenseDto.receiptId !== undefined) {
        const receipt = await this.receiptsService.findOne(
          updateExpenseDto.receiptId,
          profileId,
        );
        changes.receipt = { id: receipt.id };
      }

      const mergedExpense = this.expensesRepository.merge(expense, changes);
      const savedExpense = await this.expensesRepository.save(mergedExpense);
      return savedExpense;
    } catch {
      throw new BadRequestException('The Expense Could Not Be Updated');
    }
  }

  async createExpenseFromReceipt(
    nameExpense: string,
    descriptionExpense: string,
    valueExpense: number,
    walletName: string,
    categoryName: string,
    profileId: number,
    fileName: string,
    sizeBytes: number,
    mimeType: string,
    receiptUrl: string,
    extractionConfidence: number,
    jobId: string | undefined,
    attempts: number,
    lastError: string | undefined,
  ) {
    return await this.dataSource
      .transaction(async (manager) => {
        const walletId = await this.walletsService.findByName(
          walletName,
          profileId,
        );
        const categoriesId = await this.categoriesService.findByName(
          categoryName,
          profileId,
        );
        const newExpense: DeepPartial<Expense> = {
          name: nameExpense,
          description: descriptionExpense,
          value: valueExpense,
          categories: categoriesId.map((id) => ({ id })),
          wallet: { id: walletId },
          receipt: undefined,
          profile: { id: profileId },
        };
        const createdExpense = manager.create(Expense, newExpense);
        await manager.save(createdExpense);
        const newReceipt: DeepPartial<Receipt> = {
          fileName,
          extractionConfidence,
          fileUrl: receiptUrl,
          fileSizeBytes: sizeBytes,
          mimeType,
          status: ReceiptStatus.PENDING,
          jobId,
          attempts,
          lastError,
          expense: createdExpense,
          profile: { id: profileId },
        };
        const createdReceipt = manager.create(Receipt, newReceipt);
        await manager.save(createdReceipt);
        const mergedExpense = manager.merge(Expense, createdExpense, {
          receipt: createdReceipt,
        });
        return await manager.save(mergedExpense);
      })
      .catch(() => {
        throw new BadRequestException(
          'The Expense Could Not Be Created From Receipt',
        );
      });
  }

  async remove(id: number, profileId: number) {
    const expense = await this.findOne(id, profileId);
    const mergedExpense = this.expensesRepository.merge(expense, {
      deletedAt: new Date(),
    });
    const savedExpense = await this.expensesRepository.save(mergedExpense);
    return savedExpense.id;
  }
}

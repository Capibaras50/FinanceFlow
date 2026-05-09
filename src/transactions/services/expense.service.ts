import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { CategoriesService } from 'src/categories/services/categories.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    private walletsService: WalletsService,
    private categoriesService: CategoriesService,
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

  async findAll(profileId: number) {
    const expenses = await this.expensesRepository.find({
      where: {
        profile: { id: profileId },
        deletedAt: undefined,
      },
      relations: ['categories', 'wallet'],
    });
    return expenses;
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

      // if (updateExpenseDto.receiptId !== undefined) {
      //   const receipt = await this.receiptsService.findOne(updateExpenseDto.receiptId, profileId);
      //   changes['receipt'] = { id: receipt.id };
      // }

      const mergedExpense = this.expensesRepository.merge(expense, changes);
      const savedExpense = await this.expensesRepository.save(mergedExpense);
      return savedExpense;
    } catch {
      throw new BadRequestException('The Expense Could Not Be Updated');
    }
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

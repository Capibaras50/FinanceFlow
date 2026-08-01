import { Injectable } from '@nestjs/common';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import { SummaryTransactionDto } from '../dto/summary-transaction.dto';
import { DataSource } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { Earning } from '../entities/earning.entity';
import { TransactionTimelineInterface } from '../interfaces/transaction-timeline.interface';

const SORT_COLUMNS = new Set(['created_at', 'value']);
const SORT_ORDERS = new Set(['ASC', 'DESC']);

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  async getTransactionsTimeline(
    profileId: number,
    filterTransactionDto: FilterTransactionDto,
  ) {
    const page = filterTransactionDto.page || 1;
    const limit = filterTransactionDto.limit || 10;
    const offset = (page - 1) * limit;

    const sortColumn = SORT_COLUMNS.has(filterTransactionDto.sortBy ?? '')
      ? filterTransactionDto.sortBy
      : 'created_at';
    const sortOrder = SORT_ORDERS.has(filterTransactionDto.sortOrder ?? '')
      ? filterTransactionDto.sortOrder
      : 'DESC';

    const expensesQb = this.dataSource
      .createQueryBuilder(Expense, 'expense')
      .select('expense.id', 'id')
      .addSelect('expense.name', 'name')
      .addSelect('expense.description', 'description')
      .addSelect('expense.value', 'value')
      .addSelect('expense.created_at', 'created_at')
      .addSelect('category.type', 'type')
      .addSelect('wallet.id', 'wallet_id')
      .addSelect('wallet.name', 'wallet_name')
      .innerJoin('expense.category', 'category')
      .innerJoin('expense.wallet', 'wallet')
      .where('expense.profile_id = :profileId', { profileId });

    const earningsQb = this.dataSource
      .createQueryBuilder(Earning, 'earning')
      .select('earning.id', 'id')
      .addSelect('earning.name', 'name')
      .addSelect('earning.description', 'description')
      .addSelect('earning.value', 'value')
      .addSelect('earning.created_at', 'created_at')
      .addSelect('category.type', 'type')
      .addSelect('wallet.id', 'wallet_id')
      .addSelect('wallet.name', 'wallet_name')
      .innerJoin('earning.category', 'category')
      .innerJoin('earning.wallet', 'wallet')
      .where('earning.profile_id = :profileId', { profileId });

    if (filterTransactionDto.wallet) {
      expensesQb.andWhere('wallet.name = :walletName', {
        walletName: filterTransactionDto.wallet,
      });
      earningsQb.andWhere('wallet.name = :walletName', {
        walletName: filterTransactionDto.wallet,
      });
    }

    if (filterTransactionDto.category) {
      expensesQb.andWhere('category.name = :categoryName', {
        categoryName: filterTransactionDto.category,
      });
      earningsQb.andWhere('category.name = :categoryName', {
        categoryName: filterTransactionDto.category,
      });
    }

    if (filterTransactionDto.name) {
      expensesQb.andWhere('expense.name LIKE :name', {
        name: `%${filterTransactionDto.name}%`,
      });
      earningsQb.andWhere('earning.name LIKE :name', {
        name: `%${filterTransactionDto.name}%`,
      });
    }

    const [expensesSql, expensesParams]: [string, unknown[]] =
      expensesQb.getQueryAndParameters();
    const [earningsSql, earningsParams]: [string, unknown[]] =
      earningsQb.getQueryAndParameters();

    const offsetEarningsSql = earningsSql.replace(
      /\$(\d+)/g,
      (_, num) => `$${Number(num) + expensesParams.length}`,
    );

    const paramCount = expensesParams.length + earningsParams.length;
    const query = `(${expensesSql}) UNION ALL (${offsetEarningsSql}) ORDER BY "${sortColumn}" ${sortOrder} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

    return this.dataSource.query<TransactionTimelineInterface[]>(query, [
      ...expensesParams,
      ...earningsParams,
      limit,
      offset,
    ]);
  }

  async getSummary(profileId: number, dto: SummaryTransactionDto) {
    const from = dto.from ? new Date(dto.from) : undefined;
    const to = dto.to ? new Date(dto.to) : undefined;

    const expensesQb = this.dataSource
      .createQueryBuilder(Expense, 'expense')
      .select('COALESCE(SUM(expense.value), 0)', 'totalExpenses')
      .where('expense.profile_id = :profileId', { profileId })
      .andWhere('expense.deleted_at IS NULL');

    const earningsQb = this.dataSource
      .createQueryBuilder(Earning, 'earning')
      .select('COALESCE(SUM(earning.value), 0)', 'totalEarnings')
      .where('earning.profile_id = :profileId', { profileId })
      .andWhere('earning.deleted_at IS NULL');

    if (from) {
      expensesQb.andWhere('expense.created_at >= :from', { from });
      earningsQb.andWhere('earning.created_at >= :from', { from });
    }
    if (to) {
      expensesQb.andWhere('expense.created_at <= :to', { to });
      earningsQb.andWhere('earning.created_at <= :to', { to });
    }

    const [expenses, earnings] = await Promise.all([
      expensesQb.getRawOne<{ totalExpenses: string }>(),
      earningsQb.getRawOne<{ totalEarnings: string }>(),
    ]);

    const totalExpenses = Number(expenses?.totalExpenses ?? 0);
    const totalEarnings = Number(earnings?.totalEarnings ?? 0);

    return {
      totalExpenses,
      totalEarnings,
      balance: totalEarnings - totalExpenses,
    };
  }
}

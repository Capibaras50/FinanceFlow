import { Injectable } from '@nestjs/common';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
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
}

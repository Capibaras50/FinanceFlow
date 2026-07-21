import { Injectable } from '@nestjs/common';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import { DataSource, DeepPartial } from 'typeorm';
import { TransactionTimelineInterface } from '../interfaces/transaction-timeline.interface';

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
    const sortBy = filterTransactionDto.sortBy || 'createdAt';
    const sortOrder = filterTransactionDto.sortOrder || 'DESC';
    const params: (number | string)[] = [
      profileId,
      sortBy,
      sortOrder,
      limit,
      offset,
    ];
    let query1 = `
        SELECT expenses.id, expenses.name, expenses.description, expenses.value, expenses.created_at, categories.type FROM expenses
        INNER JOIN categories
          ON categories.id = expenses.category_id
        INNER JOIN wallets
          ON wallets.id = expenses.wallet_id
        WHERE expenses.profile_id = $1
      `;
    let query2 = `
        SELECT earnings.id, earnings.name, earnings.description, earnings.value, earnings.created_at, categories.type FROM earnings
        INNER JOIN categories
          ON categories.id = earnings.category_id
        INNER JOIN wallets
          ON wallets.id = earnings.wallet_id
        WHERE earnings.profile_id = $1
    `;
    if (filterTransactionDto.wallet) {
      query1 += ` AND wallets.name = $6`;
      query2 += ` AND wallets.name = $6`;
      params.push(filterTransactionDto.wallet);
    }
    if (filterTransactionDto.category) {
      query1 += ` AND categories.name = $7`;
      query2 += ` AND categories.name = $7`;
      params.push(filterTransactionDto.category);
    }
    const query = `
      ${query1} 
      UNION ALL 
      ${query2} 
      ORDER BY $2 $3
      LIMIT $4 OFFSET $5
    `;
    const timeline: DeepPartial<TransactionTimelineInterface> =
      await this.dataSource.query(query, params);
    return timeline;
  }
}

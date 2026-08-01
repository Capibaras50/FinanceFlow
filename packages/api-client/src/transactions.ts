import type { TransactionSummary } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface TransactionTimelineItem {
  id: number;
  name: string;
  description: string;
  value: number;
  created_at: string;
  type: 'expense' | 'earning';
  wallet_id: number;
  wallet_name: string;
}

export interface TransactionFilterParams {
  category?: string;
  wallet?: string;
  name?: string;
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface TransactionSummaryParams {
  from?: string;
  to?: string;
}

export class TransactionsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: TransactionFilterParams): Promise<TransactionTimelineItem[]> {
    return this.client.get<TransactionTimelineItem[]>('/transactions', params as Record<string, string | number | undefined>);
  }

  getSummary(params?: TransactionSummaryParams): Promise<TransactionSummary> {
    return this.client.get<TransactionSummary>('/transactions/summary', params as Record<string, string | number | undefined>);
  }
}

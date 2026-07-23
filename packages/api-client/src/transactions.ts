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
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class TransactionsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: TransactionFilterParams): Promise<TransactionTimelineItem[]> {
    return this.client.get<TransactionTimelineItem[]>('/transactions', params as Record<string, string | number | undefined>);
  }
}

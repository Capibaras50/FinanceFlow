import type { Expense, TopCategory } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateExpenseDto {
  name: string;
  description?: string;
  value: number;
  walletId: number;
  categoryId: number;
  receiptId?: number;
}

export interface ExpenseFilterParams {
  category?: string;
  wallet?: string;
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class ExpensesApi {
  constructor(private client: ApiClient) {}

  getAll(params?: ExpenseFilterParams): Promise<Expense[]> {
    return this.client.get<Expense[]>('/expenses', params as Record<string, string | number | undefined>);
  }

  getById(id: number): Promise<Expense> {
    return this.client.get<Expense>(`/expenses/${id}`);
  }

  create(dto: CreateExpenseDto): Promise<Expense> {
    return this.client.post<Expense>('/expenses', dto);
  }

  update(id: number, dto: Partial<CreateExpenseDto>): Promise<Expense> {
    return this.client.patch<Expense>(`/expenses/${id}`, dto);
  }

  delete(id: number): Promise<void> {
    return this.client.delete<void>(`/expenses/${id}`);
  }

  getTopCategories(limit?: number): Promise<TopCategory[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.client.get<TopCategory[]>(`/expenses/top-categories${query}`);
  }
}

import type { Expense, TopCategory } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateExpenseDto {
  name: string;
  description?: string;
  value: number;
  walletId: number;
  categoriesId: number[];
  receiptId?: number;
}

export class ExpensesApi {
  constructor(private client: ApiClient) {}

  getAll(): Promise<Expense[]> {
    return this.client.get<Expense[]>('/expenses');
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

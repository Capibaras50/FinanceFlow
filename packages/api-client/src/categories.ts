import type { Category } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color: string;
  type: 'expense' | 'earning';
}

export class CategoriesApi {
  constructor(private client: ApiClient) {}

  getAll(params?: Record<string, string | number | undefined>): Promise<Category[]> {
    return this.client.get<Category[]>('/categories', params);
  }

  getById(id: number): Promise<Category> {
    return this.client.get<Category>(`/categories/${id}`);
  }

  create(dto: CreateCategoryDto): Promise<Category> {
    return this.client.post<Category>('/categories', dto);
  }

  update(id: number, dto: Partial<CreateCategoryDto>): Promise<Category> {
    return this.client.patch<Category>(`/categories/${id}`, dto);
  }

  delete(id: number): Promise<void> {
    return this.client.delete<void>(`/categories/${id}`);
  }
}

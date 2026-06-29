import type { Category } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color: string;
}

export class CategoriesApi {
  constructor(private client: ApiClient) {}

  getAll(): Promise<Category[]> {
    return this.client.get<Category[]>('/categories');
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

import type { Earning } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateEarningDto {
  name: string;
  description?: string;
  value: number;
  walletId: number;
  categoryId: number;
}

export interface EarningFilterParams {
  category?: string;
  wallet?: string;
  sortBy?: 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class EarningsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: EarningFilterParams): Promise<Earning[]> {
    return this.client.get<Earning[]>('/earnings', params as Record<string, string | number | undefined>);
  }

  getById(id: number): Promise<Earning> {
    return this.client.get<Earning>(`/earnings/${id}`);
  }

  create(dto: CreateEarningDto): Promise<Earning> {
    return this.client.post<Earning>('/earnings', dto);
  }

  update(id: number, dto: Partial<CreateEarningDto>): Promise<Earning> {
    return this.client.patch<Earning>(`/earnings/${id}`, dto);
  }

  delete(id: number): Promise<void> {
    return this.client.delete<void>(`/earnings/${id}`);
  }
}

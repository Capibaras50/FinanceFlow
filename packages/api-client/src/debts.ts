import type {
  Debt,
  DebtDirection,
  DebtPriority,
  DebtStatus,
  DebtSummary,
} from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateDebtDto {
  name: string;
  description?: string;
  contactName: string;
  contactId?: number;
  amount: number;
  direction: 'receivable' | 'payable';
  debtType: 'personal' | 'bank' | 'credit_card' | 'loan' | 'commercial' | 'fiscal' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface DebtFilterParams {
  direction?: DebtDirection;
  status?: DebtStatus;
  priority?: DebtPriority;
  name?: string;
  contactName?: string;
  sortBy?: 'amount' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
}

export interface ReceiptFile {
  uri: string;
  name: string;
  type: string;
}

export class DebtsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: DebtFilterParams): Promise<Debt[]> {
    return this.client.get<Debt[]>('/debts', params as Record<string, string | number | undefined>);
  }

  getSummary(): Promise<DebtSummary> {
    return this.client.get<DebtSummary>('/debts/summary');
  }

  getById(id: number): Promise<Debt> {
    return this.client.get<Debt>(`/debts/${id}`);
  }

  create(dto: CreateDebtDto): Promise<Debt> {
    return this.client.post<Debt>('/debts', dto);
  }

  update(id: number, dto: Partial<CreateDebtDto>): Promise<Debt> {
    return this.client.patch<Debt>(`/debts/${id}`, dto);
  }

  remove(id: number): Promise<void> {
    return this.client.delete<void>(`/debts/${id}`);
  }

  pay(id: number, receipt?: ReceiptFile): Promise<Debt> {
    const path = `/debts/${id}/pay`;
    if (!receipt) {
      return this.client.patch<Debt>(path);
    }
    const formData = new FormData();
    formData.append('receipt', receipt as any);
    return this.client.uploadFile<Debt>(path, formData, 'PATCH');
  }
}

import type { Receipt } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class ReceiptsApi {
  constructor(private client: ApiClient) {}

  getAll(): Promise<Receipt[]> {
    return this.client.get<Receipt[]>('/receipts');
  }

  getById(id: number): Promise<Receipt> {
    return this.client.get<Receipt>(`/receipts/${id}`);
  }

  upload(file: { uri: string; name: string; type: string }): Promise<Receipt> {
    const formData = new FormData();
    formData.append('receipt', file as any);
    return this.client.uploadFile<Receipt>('/receipts', formData);
  }

  uploadFile(formData: FormData): Promise<Receipt> {
    return this.client.uploadFile<Receipt>('/receipts', formData);
  }

  delete(id: number): Promise<void> {
    return this.client.delete<void>(`/receipts/${id}`);
  }
}

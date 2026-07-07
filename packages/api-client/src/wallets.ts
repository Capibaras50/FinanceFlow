import type { Wallet, WalletBalance } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateWalletDto {
  name: string;
}

export class WalletsApi {
  constructor(private client: ApiClient) {}

  getAll(params?: Record<string, string | number | undefined>): Promise<Wallet[]> {
    return this.client.get<Wallet[]>('/wallets', params);
  }

  getById(id: number): Promise<Wallet> {
    return this.client.get<Wallet>(`/wallets/${id}`);
  }

  getBalance(walletId?: number): Promise<WalletBalance[]> {
    const path = walletId
      ? `/wallets/balance/${walletId}`
      : '/wallets/balance';
    return this.client.get<WalletBalance[]>(path);
  }

  create(dto: CreateWalletDto): Promise<Wallet> {
    return this.client.post<Wallet>('/wallets', dto);
  }

  update(id: number, dto: Partial<CreateWalletDto>): Promise<Wallet> {
    return this.client.patch<Wallet>(`/wallets/${id}`, dto);
  }

  delete(id: number): Promise<void> {
    return this.client.delete<void>(`/wallets/${id}`);
  }
}

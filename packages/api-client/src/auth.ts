import type { AuthResponse } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class AuthApi {
  constructor(private client: ApiClient) {}

  login(email: string, password: string): Promise<AuthResponse> {
    return this.client.post<AuthResponse>('/auth/login', { email, password });
  }
}

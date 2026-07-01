import type { AuthResponse } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export class AuthApi {
  constructor(private client: ApiClient) {}

  login(email: string, password: string): Promise<AuthResponse> {
    return this.client.post<AuthResponse>('/auth/login', { email, password });
  }

  refresh(refreshToken: string): Promise<AuthResponse> {
    return this.client.post<AuthResponse>('/auth/refresh', { refreshToken });
  }

  logout(refreshToken: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>('/auth/logout', { refreshToken });
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.client.post<{ message: string }>(`/auth/reset-password?token=${token}`, { password });
  }
}

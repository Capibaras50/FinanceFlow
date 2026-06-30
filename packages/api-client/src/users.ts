import type { User } from '@finance-flow/shared-types';
import type { ApiClient } from './client';

export interface CreateUserDto {
  email: string;
  password: string;
  profile: { name: string; avatarUrl?: string };
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  profile?: { name?: string; avatarUrl?: string };
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export class UsersApi {
  constructor(private client: ApiClient) {}

  create(dto: CreateUserDto): Promise<User> {
    return this.client.post<User>('/users', dto);
  }

  me(): Promise<User> {
    return this.client.get<User>('/users/me');
  }

  getProfile(): Promise<User['profile']> {
    return this.client.get<User['profile']>('/users/me/profile');
  }

  update(dto: UpdateUserDto): Promise<User> {
    return this.client.patch<User>('/users', dto);
  }

  delete(): Promise<void> {
    return this.client.delete<void>('/users');
  }

  changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    return this.client.patch<{ message: string }>('/users/change-password', dto);
  }
}

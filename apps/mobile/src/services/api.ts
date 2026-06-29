import {
  createApiClient,
  AuthApi,
  UsersApi,
  CategoriesApi,
  WalletsApi,
  ExpensesApi,
  EarningsApi,
  ReceiptsApi,
  ChatApi,
} from '@finance-flow/api-client';
import { getTokenSync } from './storage';

const client = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  getToken: getTokenSync,
});

export const authApi = new AuthApi(client);
export const usersApi = new UsersApi(client);
export const categoriesApi = new CategoriesApi(client);
export const walletsApi = new WalletsApi(client);
export const expensesApi = new ExpensesApi(client);
export const earningsApi = new EarningsApi(client);
export const receiptsApi = new ReceiptsApi(client);
export const chatApi = new ChatApi(client);

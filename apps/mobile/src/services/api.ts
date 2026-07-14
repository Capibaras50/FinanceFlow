import type { User } from '@finance-flow/shared-types';
import { Platform } from 'react-native';
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
import {
  getTokenSync,
  getRefreshTokenSync,
  saveToken,
  saveRefreshToken,
  removeToken,
  removeRefreshToken,
} from './storage';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

let forceLogoutHandler: (() => void) | null = null;

export function setForceLogoutHandler(handler: (() => void) | null) {
  forceLogoutHandler = handler;
}

const isWeb = Platform.OS === 'web';

const client = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  getToken: isWeb ? undefined : getTokenSync,
  getRefreshToken: isWeb ? undefined : getRefreshTokenSync,
  withCredentials: isWeb,
  onTokenRefreshed: isWeb ? undefined : (accessToken, refreshToken) => {
    saveToken(accessToken);
    saveRefreshToken(refreshToken);
  },
  onForceLogout: () => {
    if (!isWeb) {
      removeToken();
      removeRefreshToken();
    }
    forceLogoutHandler?.();
  },
});

export const authApi = new AuthApi(client);
export const usersApi = new UsersApi(client);
export const categoriesApi = new CategoriesApi(client);
export const walletsApi = new WalletsApi(client);
export const expensesApi = new ExpensesApi(client);
export const earningsApi = new EarningsApi(client);
export const receiptsApi = new ReceiptsApi(client);
export const chatApi = new ChatApi(client);

export async function uploadAvatarAsync(uri: string) {
  const token = getTokenSync();
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
  const result = await uploadAsync(`${baseUrl}/users/upload-avatar`, uri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: 'avatar',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (result.status >= 400) {
    const data = JSON.parse(result.body) as Record<string, unknown>;
    throw { message: data?.message || 'Upload failed', statusCode: result.status };
  }
  return JSON.parse(result.body) as User;
}

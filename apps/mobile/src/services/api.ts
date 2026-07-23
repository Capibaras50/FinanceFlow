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
  TransactionsApi,
} from '@finance-flow/api-client';
import {
  getTokenSync,
  getRefreshTokenSync,
  saveToken,
  saveRefreshToken,
  removeToken,
  removeRefreshToken,
} from './storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
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
export const transactionsApi = new TransactionsApi(client);

export async function uploadAvatarAsync(uri: string, fileName?: string, mimeType?: string) {
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 800, height: 800 } }],
    { compress: 0.8, format: SaveFormat.JPEG },
  );

  const name = fileName || 'avatar.jpg';
  const type = mimeType || 'image/jpeg';

  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(manipulated.uri);
    const blob = await response.blob();
    const file = new File([blob], name, { type });
    formData.append('avatar', file);
  } else {
    formData.append('avatar', {
      uri: manipulated.uri,
      name,
      type,
    } as any);
  }

  return client.uploadFile<User>('/users/upload-avatar', formData);
}

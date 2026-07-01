import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'finance_flow_token';
const REFRESH_TOKEN_KEY = 'finance_flow_refresh_token';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

export async function saveToken(token: string): Promise<void> {
  cachedAccessToken = token;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (cachedAccessToken !== null) return cachedAccessToken;
  try {
    cachedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export function getTokenSync(): string | null {
  return cachedAccessToken;
}

export async function removeToken(): Promise<void> {
  cachedAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  cachedRefreshToken = token;
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  if (cachedRefreshToken !== null) return cachedRefreshToken;
  try {
    cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return cachedRefreshToken;
  } catch {
    return null;
  }
}

export function getRefreshTokenSync(): string | null {
  return cachedRefreshToken;
}

export async function removeRefreshToken(): Promise<void> {
  cachedRefreshToken = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

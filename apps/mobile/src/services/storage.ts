import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = 'finance_flow_token';
const REFRESH_TOKEN_KEY = 'finance_flow_refresh_token';

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

const isWeb = Platform.OS === 'web';

function webSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}

function webGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

function webRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

export async function saveToken(token: string): Promise<void> {
  cachedAccessToken = token;
  if (isWeb) { webSet(ACCESS_TOKEN_KEY, token); return; }
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (cachedAccessToken !== null) return cachedAccessToken;
  if (isWeb) {
    cachedAccessToken = webGet(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  }
  try {
    cachedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export function getTokenSync(): string | null {
  return cachedAccessToken ?? (isWeb ? webGet(ACCESS_TOKEN_KEY) : null);
}

export async function removeToken(): Promise<void> {
  cachedAccessToken = null;
  if (isWeb) { webRemove(ACCESS_TOKEN_KEY); return; }
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function saveRefreshToken(token: string): Promise<void> {
  cachedRefreshToken = token;
  if (isWeb) { webSet(REFRESH_TOKEN_KEY, token); return; }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  if (cachedRefreshToken !== null) return cachedRefreshToken;
  if (isWeb) {
    cachedRefreshToken = webGet(REFRESH_TOKEN_KEY);
    return cachedRefreshToken;
  }
  try {
    cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return cachedRefreshToken;
  } catch {
    return null;
  }
}

export function getRefreshTokenSync(): string | null {
  return cachedRefreshToken ?? (isWeb ? webGet(REFRESH_TOKEN_KEY) : null);
}

export async function removeRefreshToken(): Promise<void> {
  cachedRefreshToken = null;
  if (isWeb) { webRemove(REFRESH_TOKEN_KEY); return; }
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

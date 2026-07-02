import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { authApi, usersApi, setForceLogoutHandler } from '../services/api';
import {
  saveToken,
  saveRefreshToken,
  removeToken,
  removeRefreshToken,
  getToken,
  getRefreshToken,
  getRefreshTokenSync,
} from '../services/storage';
import type { User } from '@finance-flow/shared-types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthProvider(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    setForceLogoutHandler(() => {
      removeToken();
      removeRefreshToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    });

    checkAuth().catch((err) => {
      console.warn('[Auth] checkAuth unhandled:', err);
      removeToken();
      removeRefreshToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    });

    return () => setForceLogoutHandler(null);
  }, []);

  const checkAuth = async () => {
    const accessToken = await getToken();
    console.log('[Auth] checkAuth accessToken:', accessToken ? accessToken.slice(0, 20) + '...' : 'null');

    if (!accessToken) {
      console.log('[Auth] no access token -> login');
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    const refreshToken = await getRefreshToken();
    console.log('[Auth] checkAuth refreshToken:', refreshToken ? refreshToken.slice(0, 20) + '...' : 'null');

    try {
      const user = await usersApi.me();
      console.log('[Auth] checkAuth /me succeeded');
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch (e) {
      const code = e && typeof e === 'object' && 'statusCode' in e ? (e as { statusCode: unknown }).statusCode : '?';
      const msg = e && typeof e === 'object' && 'message' in e ? (e as { message: unknown }).message : e;
      console.warn('[Auth] checkAuth /me failed: statusCode=' + code + ' msg=' + JSON.stringify(msg));

      await removeToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    console.log('[Auth] login start');
    const { accessToken, refreshToken } = await authApi.login(email, password);
    console.log('[Auth] login got tokens:', accessToken?.slice(0, 20) + '...', refreshToken?.slice(0, 20) + '...');
    await saveToken(accessToken);
    await saveRefreshToken(refreshToken);
    const user = await usersApi.me();
    console.log('[Auth] login /me succeeded');
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    await usersApi.create({
      email,
      password,
      profile: { name },
    });
    await login(email, password);
  }, [login]);

  const loginWithGoogle = useCallback(async () => {
    const redirectUri = Linking.createURL('oauth');
    const authUrl = `${API_URL}/auth?redirect_uri=${encodeURIComponent(redirectUri)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      throw new Error('Google sign-in cancelled');
    }

    const url = result.url;
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (!accessToken || !refreshToken) {
      throw new Error('Google sign-in failed');
    }

    await saveToken(accessToken);
    await saveRefreshToken(refreshToken);
    const user = await usersApi.me();
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    const currentRefreshToken = getRefreshTokenSync();
    if (currentRefreshToken) {
      try {
        await axios.post(`${API_URL}/auth/logout`, { refreshToken: currentRefreshToken });
      } catch {}
    }
    await removeToken();
    await removeRefreshToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await usersApi.me();
    setState(prev => ({ ...prev, user }));
  }, []);

  return { ...state, login, register, loginWithGoogle, logout, refreshUser };
}

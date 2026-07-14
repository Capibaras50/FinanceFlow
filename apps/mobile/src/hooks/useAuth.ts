import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
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
const isWeb = Platform.OS === 'web';

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
      if (!isWeb) {
        removeToken();
        removeRefreshToken();
      }
      setState({ user: null, isLoading: false, isAuthenticated: false });
    });

    checkAuth().catch((err) => {
      console.warn('[Auth] checkAuth unhandled:', err);
      if (!isWeb) {
        removeToken();
        removeRefreshToken();
      }
      setState({ user: null, isLoading: false, isAuthenticated: false });
    });

    return () => setForceLogoutHandler(null);
  }, []);

  const checkAuth = async () => {
    if (isWeb) {
      try {
        const user = await usersApi.me();
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
      return;
    }

    const accessToken = await getToken();

    if (!accessToken) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await usersApi.me();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      await removeToken();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    if (isWeb) {
      await authApi.login(email, password);
      const user = await usersApi.me();
      setState({ user, isLoading: false, isAuthenticated: true });
      return;
    }

    const { accessToken, refreshToken } = await authApi.login(email, password);
    await saveToken(accessToken);
    await saveRefreshToken(refreshToken);
    const user = await usersApi.me();
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
    if (isWeb) {
      window.location.href = `${API_URL}/auth`;
      return;
    }

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
    if (isWeb) {
      try {
        await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      } catch {}
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

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

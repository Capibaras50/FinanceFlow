import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, usersApi } from '../services/api';
import { saveToken, removeToken, getToken, getTokenSync } from '../services/storage';
import type { User } from '@finance-flow/shared-types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getToken();
    if (!token) {
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
    const { accessToken } = await authApi.login(email, password);
    await saveToken(accessToken);
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

  const logout = useCallback(async () => {
    await removeToken();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return { ...state, login, register, logout };
}

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiError, AuthResponse } from '@finance-flow/shared-types';

export interface ApiConfig {
  baseUrl: string;
  getToken?: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefreshed?: (accessToken: string, refreshToken: string) => void;
  onForceLogout?: () => void;
}

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: AxiosRequestConfig;
}

export class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  constructor(private config: ApiConfig) {
    this.instance = axios.create({ baseURL: config.baseUrl });

    this.instance.interceptors.request.use((reqConfig) => {
      const token = config.getToken?.();
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getAuthToken(): string | null {
    return this.config.getToken?.() ?? null;
  }

  async request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, formData?: FormData, params?: Record<string, string | number | undefined>): Promise<T> {
    const reqConfig: AxiosRequestConfig = {
      method,
      url: path,
      params,
      data: formData || body,
      headers: formData ? {} : { 'Content-Type': 'application/json' },
    };

    try {
      const response = await this.instance.request<T>(reqConfig);
      return response.data;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401 || !error.config?.headers?.Authorization) {
        return this.throwApiError(error);
      }

      const refreshFn = this.config.getRefreshToken;
      if (!refreshFn || !this.config.onTokenRefreshed) {
        return this.throwApiError(error);
      }

      const refreshToken = refreshFn();
      if (!refreshToken) {
        return this.throwApiError(error);
      }

      if (this.isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          this.failedQueue.push({
            resolve: resolve as (value: unknown) => void,
            reject,
            config: error.config!,
          });
        });
      }

      this.isRefreshing = true;

      try {
        const { data } = await axios.post<AuthResponse>(
          `${this.config.baseUrl}/auth/refresh`,
          { refreshToken },
        );

        this.config.onTokenRefreshed(data.accessToken, data.refreshToken);

        this.failedQueue.forEach((item) => {
          item.config.headers!.Authorization = `Bearer ${data.accessToken}`;
          item.resolve(this.instance(item.config));
        });
        this.failedQueue = [];

        error.config.headers!.Authorization = `Bearer ${data.accessToken}`;
        const response = await this.instance.request<T>(error.config);
        return response.data;
      } catch (refreshError) {
        this.failedQueue.forEach((item) => item.reject(refreshError));
        this.failedQueue = [];

        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
          this.config.onForceLogout?.();
        }

        return this.throwApiError(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }
  }

  private throwApiError(error: unknown): never {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as Record<string, unknown> | undefined;
      throw {
        message: typeof data?.message === 'string' ? data.message : error.message,
        statusCode: error.response.status,
      } satisfies ApiError;
    }
    const msg = error instanceof Error ? error.message : 'Network error';
    throw { message: msg, statusCode: 0 };
  }

  get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    return this.request<T>('GET', path, undefined, undefined, params);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }

  uploadFile<T>(path: string, formData: FormData, method: 'POST' | 'PATCH' = 'POST'): Promise<T> {
    return this.request<T>(method, path, undefined, formData);
  }

}

export function createApiClient(config: ApiConfig): ApiClient {
  return new ApiClient(config);
}

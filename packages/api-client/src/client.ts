import axios, { type AxiosInstance } from 'axios';
import type { ApiError } from '@finance-flow/shared-types';

export interface ApiConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ApiClient {
  private instance: AxiosInstance;

  constructor(config: ApiConfig) {
    this.instance = axios.create({ baseURL: config.baseUrl });

    this.instance.interceptors.request.use((reqConfig) => {
      const token = config.getToken?.();
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    });
  }

  async request<T>(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown, formData?: FormData): Promise<T> {
    try {
      const response = await this.instance.request<T>({
        method,
        url: path,
        data: formData || body,
        headers: formData ? {} : { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data: Record<string, unknown> | undefined = error.response.data as Record<string, unknown>;
        const apiError: ApiError = {
          message: typeof data?.message === 'string' ? data.message : error.message,
          statusCode: error.response.status,
        };
        throw apiError;
      }
      const msg = error instanceof Error ? error.message : 'Network error';
      throw { message: msg, statusCode: 0 };
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
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

  uploadFile<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>('POST', path, undefined, formData);
  }
}

export function createApiClient(config: ApiConfig): ApiClient {
  return new ApiClient(config);
}

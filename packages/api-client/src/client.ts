import type { ApiError } from '@finance-flow/shared-types';

export interface ApiConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.config.getToken?.();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(
    method: string,
    path: string,
    body?: unknown,
    formData?: FormData,
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;

    const options: RequestInit = {
      method,
      headers: formData ? {} : this.getHeaders(),
    };

    if (body && !formData) {
      options.body = JSON.stringify(body);
    }

    if (formData) {
      const token = this.config.getToken?.();
      if (token) {
        options.headers = { Authorization: `Bearer ${token}` };
      }
      options.body = formData;
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'Unknown error',
        statusCode: response.status,
      }));
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
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

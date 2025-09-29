import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultTimeout: number;

  constructor(baseUrl: string = 'http://localhost:3001', timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  async get<T>(
    endpoint: string,
    options: {
      signal?: AbortSignal;
      timeout?: number;
    } = {}
  ): Promise<Result<T, RepositoryError>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: {
      signal?: AbortSignal;
      timeout?: number;
    } = {}
  ): Promise<Result<T, RepositoryError>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: {
      signal?: AbortSignal;
      timeout?: number;
    } = {}
  ): Promise<Result<T, RepositoryError>> {
    const { signal, timeout = this.defaultTimeout } = options;

    try {
      const controller = new AbortController();
      const combinedSignal = signal ? this.combineSignals([signal, controller.signal]) : controller.signal;

      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        signal: combinedSignal,
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return Result.error(RepositoryError.notFound());
        }
        if (response.status >= 500) {
          return Result.error(RepositoryError.serverError(`Server error: ${response.status}`));
        }
        return Result.error(RepositoryError.serverError(`HTTP error: ${response.status}`));
      }

      const apiResponse: ApiResponse<T> = await response.json();

      if (!apiResponse.success) {
        return Result.error(RepositoryError.serverError(apiResponse.error || 'API returned error'));
      }

      if (!apiResponse.data) {
        return Result.error(RepositoryError.serverError('No data in response'));
      }

      return Result.success(apiResponse.data);

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return Result.error(RepositoryError.cancelled());
        }
        if (error.message.includes('timeout')) {
          return Result.error(RepositoryError.timeout());
        }
        return Result.error(RepositoryError.networkError(error.message));
      }
      return Result.error(RepositoryError.networkError('Unknown error occurred'));
    }
  }

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    signals.forEach(signal => {
      if (signal.aborted) {
        controller.abort();
      } else {
        signal.addEventListener('abort', () => controller.abort());
      }
    });

    return controller.signal;
  }
}
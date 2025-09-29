import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { RepositoryError } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Result } from '../../domain/common/Result';
import { ApiClient } from '../api/ApiClient';

export class UserRepository implements IUserRepository {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getAllUsers(signal?: AbortSignal): Promise<Result<User[], RepositoryError>> {
    const result = await this.apiClient.get<any[]>('/api/users', { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const users = result.getValue().map(userData => User.fromApiResponse(userData));
      return Result.success(users);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid user data format'));
    }
  }

  async getUserById(id: number, signal?: AbortSignal): Promise<Result<User, RepositoryError>> {
    const result = await this.apiClient.get<any>(`/api/users/${id}`, { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const user = User.fromApiResponse(result.getValue());
      return Result.success(user);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid user data format'));
    }
  }

  async createUser(name: string, email: string, signal?: AbortSignal): Promise<Result<User, RepositoryError>> {
    if (!name.trim() || !email.trim()) {
      return Result.error(RepositoryError.validationError('Name and email are required'));
    }

    const result = await this.apiClient.post<any>('/api/users', { name, email }, { signal });

    if (result.isError()) {
      return Result.error(result.getError());
    }

    try {
      const user = User.fromApiResponse(result.getValue());
      return Result.success(user);
    } catch (error) {
      return Result.error(RepositoryError.validationError('Invalid user data format'));
    }
  }
}
import { User } from '../entities/User';
import { Result } from '../common/Result';

export interface IUserRepository {
  getAllUsers(signal?: AbortSignal): Promise<Result<User[], RepositoryError>>;
  getUserById(id: number, signal?: AbortSignal): Promise<Result<User, RepositoryError>>;
  createUser(name: string, email: string, signal?: AbortSignal): Promise<Result<User, RepositoryError>>;
}

export class RepositoryError extends Error {
  public readonly code: 'NETWORK_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'TIMEOUT' | 'CANCELLED' | 'SERVER_ERROR';

  constructor(
    message: string,
    code: 'NETWORK_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'TIMEOUT' | 'CANCELLED' | 'SERVER_ERROR'
  ) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }

  static networkError(message: string = 'Network connection failed'): RepositoryError {
    return new RepositoryError(message, 'NETWORK_ERROR');
  }

  static notFound(message: string = 'Resource not found'): RepositoryError {
    return new RepositoryError(message, 'NOT_FOUND');
  }

  static validationError(message: string = 'Validation failed'): RepositoryError {
    return new RepositoryError(message, 'VALIDATION_ERROR');
  }

  static timeout(message: string = 'Request timeout'): RepositoryError {
    return new RepositoryError(message, 'TIMEOUT');
  }

  static cancelled(message: string = 'Request cancelled'): RepositoryError {
    return new RepositoryError(message, 'CANCELLED');
  }

  static serverError(message: string = 'Server error'): RepositoryError {
    return new RepositoryError(message, 'SERVER_ERROR');
  }
}
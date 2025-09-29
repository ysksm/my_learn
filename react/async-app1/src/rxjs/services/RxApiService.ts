import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Container } from '../../infrastructure/di/Container';
import { UserDto } from '../../application/dto/UserDto';
import { PollData } from '../../domain/entities/PollData';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

const container = Container.getInstance();

export class RxApiService {
  static getUsers(): Observable<UserDto[]> {
    const useCase = container.getUsersUseCase();

    return from(useCase.execute()).pipe(
      map((result: Result<UserDto[], RepositoryError>) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to get users');
      })
    );
  }

  static getUserById(id: number): Observable<UserDto> {
    const useCase = container.getUserByIdUseCase();

    return from(useCase.execute(id)).pipe(
      map((result: Result<UserDto, RepositoryError>) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to get user');
      })
    );
  }

  static createUser(name: string, email: string): Observable<UserDto> {
    const useCase = container.createUserUseCase();

    return from(useCase.execute(name, email)).pipe(
      map((result: Result<UserDto, RepositoryError>) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to create user');
      })
    );
  }

  static getPollData(): Observable<PollData> {
    const repository = container.getPollRepository();

    return from(repository.getPollData()).pipe(
      map((result: Result<PollData, RepositoryError>) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to get poll data');
      })
    );
  }

  static togglePollStatus(): Observable<PollData> {
    const repository = container.getPollRepository();

    return from(repository.togglePollStatus()).pipe(
      map((result: Result<PollData, RepositoryError>) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to toggle poll status');
      })
    );
  }

  static getAllPosts(): Observable<any[]> {
    const repository = container.getPostRepository();

    return from(repository.getAllPosts()).pipe(
      map((result) => {
        if (result.isError()) {
          throw result.getError();
        }
        return result.getValue();
      }),
      catchError((error) => {
        throw error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to get posts');
      })
    );
  }

  // タイムアウトテスト用
  static getSlowData(delay: number): Observable<any> {

    return from(
      fetch(`http://localhost:3001/api/timeout/slow/${delay}`)
        .then(response => response.json())
    ).pipe(
      map((response) => {
        if (!response.success) {
          throw RepositoryError.serverError(response.error || 'Server error');
        }
        return response.data;
      }),
      catchError((error) => {
        if (error instanceof RepositoryError) {
          throw error;
        }
        throw RepositoryError.networkError('Failed to get slow data');
      })
    );
  }
}
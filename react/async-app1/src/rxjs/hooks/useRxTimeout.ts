import { useState, useCallback } from 'react';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface RxTimeoutState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}

export function useRxTimeout<T>(
  observableFactory: () => Observable<T>,
  timeoutMs: number = 5000
): RxTimeoutState<T> & {
  execute: () => void;
  cancel: () => void;
} {
  const [state, setState] = useState<RxTimeoutState<T>>({
    data: null,
    loading: false,
    error: null
  });

  let currentSubscription: any = null;

  const execute = useCallback(() => {
    // 前回のリクエストをキャンセル
    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }

    setState({
      data: null,
      loading: true,
      error: null
    });

    try {
      const observable = observableFactory().pipe(
        timeout(timeoutMs),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            return throwError(() => RepositoryError.timeout(`Request timeout after ${timeoutMs}ms`));
          }
          return throwError(() => error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected error occurred')
          );
        })
      );

      currentSubscription = observable.subscribe({
        next: (data) => {
          setState({
            data,
            loading: false,
            error: null
          });
        },
        error: (error) => {
          setState({
            data: null,
            loading: false,
            error: error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Unexpected error occurred')
          });
        }
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to create observable')
      });
    }
  }, [observableFactory, timeoutMs]);

  const cancel = useCallback(() => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
      setState(prev => ({
        ...prev,
        loading: false,
        error: RepositoryError.cancelled('Request cancelled by user')
      }));
    }
  }, []);

  return {
    ...state,
    execute,
    cancel
  };
}
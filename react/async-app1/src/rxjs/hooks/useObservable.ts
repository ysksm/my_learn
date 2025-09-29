import { useState, useEffect, useRef } from 'react';
import { Observable, Subscription } from 'rxjs';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface ObservableState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}

export function useObservable<T>(
  observableFactory: () => Observable<T>,
  deps: React.DependencyList = []
): ObservableState<T> & { refetch: () => void } {
  const [state, setState] = useState<ObservableState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const subscriptionRef = useRef<Subscription | null>(null);

  const execute = () => {
    // 前回のサブスクリプションをクリーンアップ
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const observable = observableFactory();

      subscriptionRef.current = observable.subscribe({
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
  };

  const refetch = () => {
    execute();
  };

  useEffect(() => {
    execute();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, deps);

  return {
    ...state,
    refetch
  };
}
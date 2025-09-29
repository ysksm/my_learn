import { useState, useCallback } from 'react';
import { Observable, combineLatest, concat, of } from 'rxjs';
import { map, scan, catchError } from 'rxjs/operators';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface RxMultipleState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
  progress: number; // 0-100の進行状況
}

export function useRxMultiple<T>(
  observableFactories: Array<() => Observable<any>>,
  combiner: (results: any[]) => T
): RxMultipleState<T> & {
  executeParallel: () => void;
  executeSequential: () => void;
  cancel: () => void;
} {
  const [state, setState] = useState<RxMultipleState<T>>({
    data: null,
    loading: false,
    error: null,
    progress: 0
  });

  let currentSubscription: any = null;

  const executeParallel = useCallback(() => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }

    setState({
      data: null,
      loading: true,
      error: null,
      progress: 0
    });

    try {
      const observables = observableFactories.map(factory =>
        factory().pipe(
          catchError(error => {
            throw error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Parallel execution error');
          })
        )
      );

      const combinedObservable = combineLatest(observables).pipe(
        map(results => combiner(results)),
        catchError(error => {
          setState({
            data: null,
            loading: false,
            error: error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Parallel execution failed'),
            progress: 0
          });
          return of(null);
        })
      );

      currentSubscription = combinedObservable.subscribe({
        next: (data) => {
          if (data !== null) {
            setState({
              data,
              loading: false,
              error: null,
              progress: 100
            });
          }
        },
        error: (error) => {
          setState({
            data: null,
            loading: false,
            error: error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Unexpected parallel error'),
            progress: 0
          });
        }
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to create parallel observables'),
        progress: 0
      });
    }
  }, [observableFactories, combiner]);

  const executeSequential = useCallback(() => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }

    setState({
      data: null,
      loading: true,
      error: null,
      progress: 0
    });

    try {
      // 逐次実行のためのObservableを構築
      const sequentialObservables = observableFactories.reduce((acc, factory, index) => {
        const wrappedObservable = factory().pipe(
          map(result => ({ index, result, type: 'result' as const })),
          catchError(error => {
            throw error instanceof RepositoryError
              ? error
              : RepositoryError.networkError(`Sequential execution error at step ${index + 1}`);
          })
        );

        return acc.length === 0 ? [wrappedObservable] : [...acc, wrappedObservable];
      }, [] as Observable<{ index: number; result: any; type: 'result' }>[]);

      if (sequentialObservables.length === 0) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const sequentialStream = concat(...sequentialObservables).pipe(
        scan((acc, curr) => {
          const newResults = [...acc];
          newResults[curr.index] = curr.result;
          return newResults;
        }, [] as any[]),
        map((results, index) => {
          const progress = ((index + 1) / observableFactories.length) * 100;
          setState(prev => ({ ...prev, progress }));
          return results;
        }),
        catchError(error => {
          setState({
            data: null,
            loading: false,
            error: error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Sequential execution failed'),
            progress: 0
          });
          return of([]);
        })
      );

      currentSubscription = sequentialStream.subscribe({
        next: (results) => {
          if (results.length === observableFactories.length) {
            // すべて完了
            const combinedData = combiner(results);
            setState(prev => ({
              ...prev,
              data: combinedData,
              loading: false,
              error: null,
              progress: 100
            }));
          }
        },
        error: (error) => {
          setState({
            data: null,
            loading: false,
            error: error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Unexpected sequential error'),
            progress: 0
          });
        }
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof RepositoryError
          ? error
          : RepositoryError.networkError('Failed to create sequential observables'),
        progress: 0
      });
    }
  }, [observableFactories, combiner]);

  const cancel = useCallback(() => {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
      setState(prev => ({
        ...prev,
        loading: false,
        error: RepositoryError.cancelled('Request cancelled by user'),
        progress: 0
      }));
    }
  }, []);

  return {
    ...state,
    executeParallel,
    executeSequential,
    cancel
  };
}
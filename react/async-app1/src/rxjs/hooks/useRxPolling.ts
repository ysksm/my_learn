import { useState, useEffect, useRef, useCallback } from 'react';
import { Observable, Subscription, interval, NEVER } from 'rxjs';
import { switchMap, takeUntil, startWith, catchError } from 'rxjs/operators';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface RxPollingState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
  isPolling: boolean;
}

export function useRxPolling<T>(
  observableFactory: () => Observable<T>,
  intervalMs: number = 2000,
  autoStart: boolean = false
): RxPollingState<T> & {
  start: () => void;
  stop: () => void;
  refetch: () => void;
} {
  const [state, setState] = useState<RxPollingState<T>>({
    data: null,
    loading: false,
    error: null,
    isPolling: false
  });

  const subscriptionRef = useRef<Subscription | null>(null);
  const stopSubjectRef = useRef<{ next: () => void; complete: () => void } | null>(null);

  const createStopSubject = () => {
    let observer: any = null;
    const observable = new Observable(obs => {
      observer = obs;
      return () => {}; // cleanup
    });

    return {
      observable,
      next: () => observer?.next(),
      complete: () => observer?.complete()
    };
  };

  const start = useCallback(() => {
    if (subscriptionRef.current) {
      return; // 既に開始されている
    }

    setState(prev => ({ ...prev, isPolling: true }));

    // 停止用のSubjectを作成
    const stopSubject = createStopSubject();
    stopSubjectRef.current = stopSubject;

    // 即座に1回実行してから定期実行
    const pollingObservable = interval(intervalMs).pipe(
      startWith(0), // 即座に開始
      switchMap(() => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        return observableFactory().pipe(
          catchError(error => {
            const repositoryError = error instanceof RepositoryError
              ? error
              : RepositoryError.networkError('Polling error occurred');

            setState(prev => ({
              ...prev,
              loading: false,
              error: repositoryError
            }));

            // エラーが発生してもポーリングを継続
            return NEVER;
          })
        );
      }),
      takeUntil(stopSubject.observable)
    );

    subscriptionRef.current = pollingObservable.subscribe({
      next: (data) => {
        setState(prev => ({
          ...prev,
          data,
          loading: false,
          error: null
        }));
      },
      error: (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected polling error')
        }));
      }
    });
  }, [observableFactory, intervalMs]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPolling: false, loading: false }));

    if (stopSubjectRef.current) {
      stopSubjectRef.current.next();
      stopSubjectRef.current.complete();
      stopSubjectRef.current = null;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, []);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    observableFactory().subscribe({
      next: (data) => {
        setState(prev => ({
          ...prev,
          data,
          loading: false,
          error: null
        }));
      },
      error: (error) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Refetch error occurred')
        }));
      }
    });
  }, [observableFactory]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return {
    ...state,
    start,
    stop,
    refetch
  };
}
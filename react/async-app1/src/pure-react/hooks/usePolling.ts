import { useState, useEffect, useRef, useCallback } from 'react';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface PollingState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
  isPolling: boolean;
}

export function usePolling<T>(
  asyncFunction: (signal: AbortSignal) => Promise<Result<T, RepositoryError>>,
  interval: number = 2000,
  autoStart: boolean = false
): PollingState<T> & {
  start: () => void;
  stop: () => void;
  refetch: () => void;
} {
  const [state, setState] = useState<PollingState<T>>({
    data: null,
    loading: false,
    error: null,
    isPolling: false
  });

  const intervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(signal);

      if (!signal.aborted) {
        if (result.isSuccess()) {
          setState(prev => ({
            ...prev,
            data: result.getValue(),
            loading: false,
            error: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            data: null,
            loading: false,
            error: result.getError()
          }));
        }
      }
    } catch (error) {
      if (!signal.aborted) {
        setState(prev => ({
          ...prev,
          data: null,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected error occurred')
        }));
      }
    }
  }, [asyncFunction]);

  const start = useCallback(() => {
    if (intervalRef.current) return; // 既に開始されている場合は何もしない

    setState(prev => ({ ...prev, isPolling: true }));

    // 最初に1回実行
    execute();

    // その後定期実行
    intervalRef.current = setInterval(() => {
      execute();
    }, interval);
  }, [execute, interval]);

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isPolling: false }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

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
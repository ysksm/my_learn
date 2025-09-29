import { useState, useCallback } from 'react';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface TimeoutState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}

export function useTimeout<T>(
  asyncFunction: (signal: AbortSignal) => Promise<Result<T, RepositoryError>>,
  timeoutMs: number = 5000
): TimeoutState<T> & {
  execute: () => Promise<void>;
  cancel: () => void;
} {
  const [state, setState] = useState<TimeoutState<T>>({
    data: null,
    loading: false,
    error: null
  });

  let currentController: AbortController | null = null;

  const execute = useCallback(async () => {
    // 前回のリクエストをキャンセル
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    setState({
      data: null,
      loading: true,
      error: null
    });

    try {
      // Promise.raceでタイムアウトを実装
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          if (!signal.aborted) {
            reject(RepositoryError.timeout(`Request timeout after ${timeoutMs}ms`));
          }
        }, timeoutMs);

        // シグナルがアボートされたらタイムアウトをクリア
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
        });
      });

      const result = await Promise.race([
        asyncFunction(signal),
        timeoutPromise
      ]);

      if (!signal.aborted) {
        if (result.isSuccess()) {
          setState({
            data: result.getValue(),
            loading: false,
            error: null
          });
        } else {
          setState({
            data: null,
            loading: false,
            error: result.getError()
          });
        }
      }
    } catch (error) {
      if (!signal.aborted) {
        setState({
          data: null,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected error occurred')
        });
      }
    }
  }, [asyncFunction, timeoutMs]);

  const cancel = useCallback(() => {
    if (currentController) {
      currentController.abort();
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
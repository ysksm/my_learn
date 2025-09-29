import { useState, useEffect, useRef, useCallback } from 'react';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
}

export function useAsyncState<T>(
  asyncFunction: (signal: AbortSignal) => Promise<Result<T, RepositoryError>>,
  deps: React.DependencyList = []
): AsyncState<T> & { refetch: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    // 前回のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 新しいAbortControllerを作成
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await asyncFunction(signal);

      // リクエストがキャンセルされていないかチェック
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
  }, deps);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  useEffect(() => {
    execute();

    // クリーンアップ関数で進行中のリクエストをキャンセル
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, deps);

  return {
    ...state,
    refetch
  };
}
import { useState, useCallback } from 'react';
import { Result } from '../../domain/common/Result';
import { RepositoryError } from '../../domain/repositories/IUserRepository';

interface MultipleAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: RepositoryError | null;
  progress: number; // 0-100の進行状況
}

export function useMultipleAsync<T>(
  asyncFunctions: Array<(signal: AbortSignal) => Promise<Result<any, RepositoryError>>>,
  combiner: (results: any[]) => T
): MultipleAsyncState<T> & {
  executeParallel: () => Promise<void>;
  executeSequential: () => Promise<void>;
  cancel: () => void;
} {
  const [state, setState] = useState<MultipleAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    progress: 0
  });

  let currentController: AbortController | null = null;

  const executeParallel = useCallback(async () => {
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    setState({
      data: null,
      loading: true,
      error: null,
      progress: 0
    });

    try {
      const results = await Promise.all(
        asyncFunctions.map(fn => fn(signal))
      );

      if (!signal.aborted) {
        // すべてのリザルトをチェック
        const errors = results.filter(result => result.isError());
        if (errors.length > 0) {
          setState({
            data: null,
            loading: false,
            error: errors[0].getError(),
            progress: 0
          });
          return;
        }

        const values = results.map(result => result.getValue());
        const combinedData = combiner(values);

        setState({
          data: combinedData,
          loading: false,
          error: null,
          progress: 100
        });
      }
    } catch (error) {
      if (!signal.aborted) {
        setState({
          data: null,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected error occurred'),
          progress: 0
        });
      }
    }
  }, [asyncFunctions, combiner]);

  const executeSequential = useCallback(async () => {
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    setState({
      data: null,
      loading: true,
      error: null,
      progress: 0
    });

    try {
      const results: any[] = [];

      for (let i = 0; i < asyncFunctions.length; i++) {
        if (signal.aborted) break;

        const result = await asyncFunctions[i](signal);

        if (result.isError()) {
          setState({
            data: null,
            loading: false,
            error: result.getError(),
            progress: 0
          });
          return;
        }

        results.push(result.getValue());

        // 進行状況を更新
        const progress = ((i + 1) / asyncFunctions.length) * 100;
        setState(prev => ({ ...prev, progress }));
      }

      if (!signal.aborted) {
        const combinedData = combiner(results);

        setState({
          data: combinedData,
          loading: false,
          error: null,
          progress: 100
        });
      }
    } catch (error) {
      if (!signal.aborted) {
        setState({
          data: null,
          loading: false,
          error: error instanceof RepositoryError
            ? error
            : RepositoryError.networkError('Unexpected error occurred'),
          progress: 0
        });
      }
    }
  }, [asyncFunctions, combiner]);

  const cancel = useCallback(() => {
    if (currentController) {
      currentController.abort();
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
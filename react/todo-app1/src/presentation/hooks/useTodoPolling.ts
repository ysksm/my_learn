import { useState, useEffect } from 'react';
import { Todo } from '../../domain/models/Todo';
import { GetTodosUseCase } from '../../application/usecases/GetTodosUseCase';
import { container } from '../../application/di/container';

export function useTodoPolling(intervalMs: number = 5000) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());

    const fetchTodos = async () => {
      try {
        const fetchedTodos = await getTodosUseCase.execute();
        setTodos(fetchedTodos);
        setLastUpdated(new Date());
        setLoading(false);
        console.log('[Polling] Todoを取得しました:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('[Polling] エラー:', error);
      }
    };

    // 初回実行
    fetchTodos();

    // ポーリング開始
    const intervalId = setInterval(fetchTodos, intervalMs);

    // クリーンアップ
    return () => {
      clearInterval(intervalId);
      console.log('[Polling] ポーリングを停止しました');
    };
  }, [intervalMs]);

  return { todos, loading, lastUpdated };
}

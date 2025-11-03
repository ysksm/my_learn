import { useState, useEffect, useCallback } from 'react';
import { Todo } from './domain/models/Todo';
import { TodoList } from './presentation/components/TodoList';
import { GetTodosUseCase } from './application/usecases/GetTodosUseCase';
import { container } from './application/di/container';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
      const fetchedTodos = await getTodosUseCase.execute();
      setTodos(fetchedTodos);
      setLastUpdated(new Date());
      setLoading(false);
      console.log('[Polling] Todoを取得しました:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('[Polling] エラー:', error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    const intervalId = setInterval(fetchTodos, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTodos]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Todo アプリケーション</h1>
      {lastUpdated && (
        <p style={{ fontSize: '12px', color: '#666' }}>
          最終更新: {lastUpdated.toLocaleTimeString()} (5秒ごとに自動更新)
        </p>
      )}
      {loading ? <p>読み込み中...</p> : <TodoList todos={todos} onUpdate={fetchTodos} />}
    </div>
  );
}

export default App;

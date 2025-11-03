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
      console.log('[fetchTodos] データ取得開始');
      const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
      const fetchedTodos = await getTodosUseCase.execute();
      console.log('[fetchTodos] 取得したTodo数:', fetchedTodos.length);
      console.log('[fetchTodos] Todoの内容:', fetchedTodos.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        assignee: t.assignee?.name
      })));
      setTodos([...fetchedTodos]); // 新しい配列参照を作成
      setLastUpdated(new Date());
      setLoading(false);
      console.log('[fetchTodos] 状態更新完了');
    } catch (error) {
      console.error('[Polling] エラー:', error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    const intervalId = setInterval(fetchTodos, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTodos]);

  // 他のタブでの変更を検知してデータを同期
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todo-app-data' || e.key === null) {
        console.log('[Storage Event] 他のタブでデータが変更されました。再読み込みします。');
        fetchTodos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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

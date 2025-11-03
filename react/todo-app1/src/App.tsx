import { useEffect } from 'react';
import { TodoList } from './presentation/components/TodoList';
import { useAppDispatch, useAppSelector } from './presentation/store/hooks';
import { fetchTodos, selectLoading, selectLastUpdated, selectError } from './presentation/store/slices/todoSlice';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const error = useAppSelector(selectError);

  // 初回読み込みとポーリング（5秒ごと）
  useEffect(() => {
    dispatch(fetchTodos());
    const intervalId = setInterval(() => {
      dispatch(fetchTodos());
    }, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // 他のタブでの変更を検知してデータを同期
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todo-app-data' || e.key === null) {
        console.log('[Storage Event] 他のタブでデータが変更されました。再読み込みします。');
        dispatch(fetchTodos());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Todo アプリケーション</h1>
      {lastUpdated && (
        <p style={{ fontSize: '12px', color: '#666' }}>
          最終更新: {lastUpdated.toLocaleTimeString()} (5秒ごとに自動更新)
        </p>
      )}
      {error && (
        <p style={{ color: 'red', fontSize: '14px' }}>
          エラー: {error}
        </p>
      )}
      {loading ? <p>読み込み中...</p> : <TodoList />}
    </div>
  );
}

export default App;

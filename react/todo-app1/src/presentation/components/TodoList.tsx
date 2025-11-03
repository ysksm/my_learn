import { useEffect } from 'react';
import { TodoItem } from './TodoItem';
import { useAppSelector } from '../store/hooks';
import { selectTodos } from '../store/slices/todoSlice';

export function TodoList() {
  const todos = useAppSelector(selectTodos);

  useEffect(() => {
    console.log('[TodoList] 再レンダリング、Todo数:', todos.length);
    console.log('[TodoList] Todoの内容:', todos.map(t => ({ id: t.id, status: t.status, assignee: t.assignee?.name })));
  }, [todos]);

  if (todos.length === 0) {
    return <p>Todoがありません</p>;
  }

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}

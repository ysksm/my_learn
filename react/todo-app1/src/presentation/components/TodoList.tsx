import { useEffect } from 'react';
import { Todo } from '../../domain/models/Todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: () => void;
}

export function TodoList({ todos, onUpdate }: TodoListProps) {
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
        <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

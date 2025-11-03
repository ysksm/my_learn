import { Todo } from '../../domain/models/Todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: () => void;
}

export function TodoList({ todos, onUpdate }: TodoListProps) {
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

import { Todo } from '../../domain/models/Todo';
import type { TodoStatus } from '../../domain/models/TodoStatus';
import { Assignee } from '../../domain/models/Assignee';
import { AssigneeSelector } from './AssigneeSelector';
import { UpdateTodoStatusUseCase } from '../../application/usecases/UpdateTodoStatusUseCase';
import { UpdateTodoAssigneeUseCase } from '../../application/usecases/UpdateTodoAssigneeUseCase';
import { container } from '../../application/di/container';

interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
}

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TodoStatus;
    const updateStatusUseCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
    await updateStatusUseCase.execute(todo.id, newStatus);
    onUpdate();
  };

  const handleAssigneeChange = async (newAssignee: Assignee | null) => {
    const updateAssigneeUseCase = new UpdateTodoAssigneeUseCase(
      container.getTodoRepository()
    );
    await updateAssigneeUseCase.execute(todo.id, newAssignee);
    onUpdate();
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '12px',
        marginBottom: '8px',
        borderRadius: '4px',
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{todo.title}</h3>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '14px', marginRight: '8px' }}>状態:</label>
          <select
            value={todo.status}
            onChange={handleStatusChange}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
            }}
          >
            <option value="pending">⏳ 未着手</option>
            <option value="in_progress">🔄 進行中</option>
            <option value="completed">✅ 完了</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '14px', marginRight: '8px' }}>担当:</label>
          <AssigneeSelector currentAssignee={todo.assignee} onChange={handleAssigneeChange} />
        </div>
      </div>
    </div>
  );
}

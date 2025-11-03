import type { Todo } from '../../domain/models/Todo';
import type { TodoStatus } from '../../domain/models/TodoStatus';
import type { Assignee } from '../../domain/models/Assignee';
import { AssigneeSelector } from './AssigneeSelector';
import { useAppDispatch } from '../store/hooks';
import { updateTodoStatus, updateTodoAssignee } from '../store/slices/todoSlice';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const dispatch = useAppDispatch();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TodoStatus;
    console.log('[TodoItem] 状態変更開始:', { id: todo.id, oldStatus: todo.status, newStatus });
    await dispatch(updateTodoStatus({ todoId: todo.id, newStatus }));
    console.log('[TodoItem] 状態変更完了');
  };

  const handleAssigneeChange = async (newAssignee: Assignee | null) => {
    console.log('[TodoItem] 担当者変更開始:', { id: todo.id, oldAssignee: todo.assignee?.name, newAssignee: newAssignee?.name });
    await dispatch(updateTodoAssignee({ todoId: todo.id, newAssignee }));
    console.log('[TodoItem] 担当者変更完了');
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

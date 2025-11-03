export type TodoStatus = 'pending' | 'in_progress' | 'completed';

export const TodoStatuses = {
  PENDING: 'pending' as TodoStatus,
  IN_PROGRESS: 'in_progress' as TodoStatus,
  COMPLETED: 'completed' as TodoStatus,
} as const;

import type { TodoStatus } from './TodoStatus';
import { Assignee } from './Assignee';

export class Todo {
  readonly id: string;
  readonly title: string;
  readonly status: TodoStatus;
  readonly assignee: Assignee | null;

  constructor(id: string, title: string, status: TodoStatus, assignee: Assignee | null) {
    this.id = id;
    this.title = title;
    this.status = status;
    this.assignee = assignee;
  }

  updateStatus(newStatus: TodoStatus): Todo {
    return new Todo(this.id, this.title, newStatus, this.assignee);
  }

  updateAssignee(newAssignee: Assignee | null): Todo {
    return new Todo(this.id, this.title, this.status, newAssignee);
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }
}

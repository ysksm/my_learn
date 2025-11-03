import { Assignee } from '../../domain/models/Assignee';
import type { TodoRepository } from '../../domain/repositories/TodoRepository';

export class UpdateTodoAssigneeUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(todoId: string, newAssignee: Assignee | null): Promise<void> {
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) {
      throw new Error(`Todo not found: ${todoId}`);
    }

    const updatedTodo = todo.updateAssignee(newAssignee);
    await this.todoRepository.update(updatedTodo);
  }
}

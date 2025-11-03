import type { TodoStatus } from '../../domain/models/TodoStatus';
import type { TodoRepository } from '../../domain/repositories/TodoRepository';

export class UpdateTodoStatusUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(todoId: string, newStatus: TodoStatus): Promise<void> {
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) {
      throw new Error(`Todo not found: ${todoId}`);
    }

    const updatedTodo = todo.updateStatus(newStatus);
    await this.todoRepository.update(updatedTodo);
  }
}

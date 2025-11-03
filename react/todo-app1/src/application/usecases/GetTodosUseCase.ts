import { Todo } from '../../domain/models/Todo';
import type { TodoRepository } from '../../domain/repositories/TodoRepository';

export class GetTodosUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.findAll();
  }
}

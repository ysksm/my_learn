import { Todo } from '../models/Todo';

export interface TodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(todo: Todo): Promise<void>;
}

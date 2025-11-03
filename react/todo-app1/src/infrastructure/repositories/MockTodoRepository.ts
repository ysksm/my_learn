import type { TodoRepository } from '../../domain/repositories/TodoRepository';
import { Todo } from '../../domain/models/Todo';
import { Assignee } from '../../domain/models/Assignee';

export class MockTodoRepository implements TodoRepository {
  private todos: Todo[];

  constructor() {
    // モックデータを初期化
    const assignee1 = new Assignee('u1', '田中太郎');
    const assignee2 = new Assignee('u2', '佐藤花子');

    this.todos = [
      new Todo('1', 'レイヤードアーキテクチャの設計', 'completed', assignee1),
      new Todo('2', 'Domain層の実装', 'in_progress', assignee2),
      new Todo('3', 'ポーリング機能の実装', 'pending', assignee1),
      new Todo('4', 'UI実装', 'pending', assignee2),
    ];
  }

  async findAll(): Promise<Todo[]> {
    // 非同期処理をシミュレート
    await this.delay(100);
    return [...this.todos];
  }

  async findById(id: string): Promise<Todo | null> {
    await this.delay(50);
    const todo = this.todos.find((t) => t.id === id);
    return todo || null;
  }

  async update(todo: Todo): Promise<void> {
    await this.delay(50);
    const index = this.todos.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      this.todos[index] = todo;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

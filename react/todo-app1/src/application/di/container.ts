import type { TodoRepository } from '../../domain/repositories/TodoRepository';
import { LocalStorageTodoRepository } from '../../infrastructure/repositories/LocalStorageTodoRepository';

// DIコンテナ - シングルトンパターン
class Container {
  private static instance: Container;
  private todoRepository: TodoRepository;

  private constructor() {
    // LocalStorageリポジトリをインスタンス化
    this.todoRepository = new LocalStorageTodoRepository();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  getTodoRepository(): TodoRepository {
    return this.todoRepository;
  }

  // 将来的に実際のリポジトリに差し替える場合
  setTodoRepository(repository: TodoRepository): void {
    this.todoRepository = repository;
  }
}

export const container = Container.getInstance();

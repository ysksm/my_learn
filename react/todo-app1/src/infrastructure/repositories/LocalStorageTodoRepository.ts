import type { TodoRepository } from '../../domain/repositories/TodoRepository';
import { Todo } from '../../domain/models/Todo';
import { Assignee } from '../../domain/models/Assignee';
import type { TodoStatus } from '../../domain/models/TodoStatus';

const STORAGE_KEY = 'todo-app-data';

// シリアライズ用の型定義
interface SerializedTodo {
  id: string;
  title: string;
  status: TodoStatus;
  assignee: { id: string; name: string } | null;
}

export class LocalStorageTodoRepository implements TodoRepository {
  private todos: Todo[];

  constructor() {
    this.todos = this.loadFromStorage();

    // 初回起動時は初期データをセット
    if (this.todos.length === 0) {
      this.todos = this.getInitialData();
      this.saveToStorage();
    }
  }

  async findAll(): Promise<Todo[]> {
    await this.delay(50);
    // 毎回LocalStorageから最新のデータを読み込む（複数タブ同期のため）
    this.todos = this.loadFromStorage();
    if (this.todos.length === 0) {
      this.todos = this.getInitialData();
      this.saveToStorage();
    }
    // 新しいインスタンスを作成して返す
    return this.todos.map(
      (todo) =>
        new Todo(
          todo.id,
          todo.title,
          todo.status,
          todo.assignee ? new Assignee(todo.assignee.id, todo.assignee.name) : null
        )
    );
  }

  async findById(id: string): Promise<Todo | null> {
    await this.delay(50);
    // 毎回LocalStorageから最新のデータを読み込む（複数タブ同期のため）
    this.todos = this.loadFromStorage();
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return null;
    // 新しいインスタンスを作成して返す
    return new Todo(
      todo.id,
      todo.title,
      todo.status,
      todo.assignee ? new Assignee(todo.assignee.id, todo.assignee.name) : null
    );
  }

  async update(todo: Todo): Promise<void> {
    await this.delay(50);
    // 更新前に最新のデータを読み込む（複数タブ同期のため）
    this.todos = this.loadFromStorage();
    const index = this.todos.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      console.log('[LocalStorage] Todo更新:', { id: todo.id, status: todo.status, assignee: todo.assignee?.name });
      this.todos[index] = todo;
      this.saveToStorage();
      console.log('[LocalStorage] 更新後のデータ:', this.todos.map(t => ({ id: t.id, status: t.status })));
    }
  }

  // LocalStorageに保存
  private saveToStorage(): void {
    try {
      const serialized: SerializedTodo[] = this.todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        status: todo.status,
        assignee: todo.assignee
          ? { id: todo.assignee.id, name: todo.assignee.name }
          : null,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      console.log('[LocalStorage] データを保存しました');
    } catch (error) {
      console.error('[LocalStorage] 保存エラー:', error);
    }
  }

  // LocalStorageから読み込み
  private loadFromStorage(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        console.log('[LocalStorage] データが見つかりません。初期化します。');
        return [];
      }

      const serialized: SerializedTodo[] = JSON.parse(data);
      const todos = serialized.map(
        (item) =>
          new Todo(
            item.id,
            item.title,
            item.status,
            item.assignee ? new Assignee(item.assignee.id, item.assignee.name) : null
          )
      );
      console.log('[LocalStorage] データを読み込みました:', todos.length, '件');
      return todos;
    } catch (error) {
      console.error('[LocalStorage] 読み込みエラー:', error);
      return [];
    }
  }

  // 初期データ
  private getInitialData(): Todo[] {
    const assignee1 = new Assignee('u1', '田中太郎');
    const assignee2 = new Assignee('u2', '佐藤花子');

    return [
      new Todo('1', 'レイヤードアーキテクチャの設計', 'completed', assignee1),
      new Todo('2', 'Domain層の実装', 'in_progress', assignee2),
      new Todo('3', 'ポーリング機能の実装', 'pending', assignee1),
      new Todo('4', 'UI実装', 'pending', assignee2),
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

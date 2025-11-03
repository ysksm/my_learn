# Application層

## 概要

Application層は、アプリケーション固有のビジネスロジックを実装します。ユースケース（Use Case）を通じて、Domain層のエンティティとInfrastructure層のリポジトリを組み合わせ、アプリケーションの機能を実現します。

## 責務

- ユースケースの実装
- ドメインロジックの組み合わせ
- トランザクション管理（将来）
- DIコンテナの管理

## ファイル構成

```
src/application/
├── usecases/
│   ├── GetTodosUseCase.ts           # Todo一覧取得
│   ├── UpdateTodoStatusUseCase.ts   # 状態更新
│   └── UpdateTodoAssigneeUseCase.ts # 担当者更新
└── di/
    └── container.ts                  # DIコンテナ
```

---

## Use Cases

### 1. GetTodosUseCase.ts

#### 目的
すべてのTodoを取得するユースケース

#### クラス定義

```typescript
export class GetTodosUseCase {
  private todoRepository: TodoRepository;

  constructor(todoRepository: TodoRepository) {
    this.todoRepository = todoRepository;
  }

  async execute(): Promise<Todo[]> {
    return await this.todoRepository.findAll();
  }
}
```

#### 設計パターン: Use Case Pattern

**特徴**:
- アプリケーション固有のロジックをカプセル化
- 単一責任の原則（SRP）
- テストが容易

#### 使用例

```typescript
// DIコンテナからリポジトリを取得
const repository = container.getTodoRepository();
// UseCaseを作成
const useCase = new GetTodosUseCase(repository);
// 実行
const todos = await useCase.execute();
```

#### 責務
- リポジトリを呼び出してTodoを取得
- エラーハンドリング（現在は伝播）
- 将来的な拡張ポイント：
  - フィルタリング
  - ソート
  - ページング

---

### 2. UpdateTodoStatusUseCase.ts

#### 目的
Todoの状態を更新するユースケース

#### クラス定義

```typescript
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
```

#### 処理フロー

```
1. todoIdでTodoを検索
   ↓
2. Todoが見つからなければエラー
   ↓
3. Todo.updateStatus()で新しいTodoを作成
   ↓
4. リポジトリに更新を依頼
```

#### エラーハンドリング

**エラーケース**:
- Todoが存在しない場合: `Error`をスロー
- リポジトリエラー: 例外を伝播

#### ビジネスルール

- 状態の変更は`Todo`エンティティのメソッドを使用
- イミュータブルパターン（新しいインスタンスを作成）
- バリデーションはDomain層で実施（将来的）

---

### 3. UpdateTodoAssigneeUseCase.ts

#### 目的
Todoの担当者を更新するユースケース

#### クラス定義

```typescript
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
```

#### 処理フロー

```
1. todoIdでTodoを検索
   ↓
2. Todoが見つからなければエラー
   ↓
3. Todo.updateAssignee()で新しいTodoを作成
   ↓
4. リポジトリに更新を依頼
```

#### 担当者の割り当てルール

- `newAssignee`が`null`の場合は未割当になる
- 既存の担当者は上書きされる
- 存在しない担当者IDのチェックは現在未実施（将来の改善ポイント）

---

## DI Container

### container.ts

#### 目的
依存性注入コンテナを提供し、リポジトリのライフサイクルを管理

#### クラス定義

```typescript
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

  // 将来的に実装を切り替える場合
  setTodoRepository(repository: TodoRepository): void {
    this.todoRepository = repository;
  }
}

export const container = Container.getInstance();
```

#### 設計パターン: Singleton

**目的**:
- アプリケーション全体で単一のリポジトリインスタンスを共有
- メモリ効率の向上
- 状態の一貫性

#### DIの流れ

```
1. container.ts でリポジトリをインスタンス化
   ↓
2. UseCaseはコンストラクタでリポジトリを受け取る
   ↓
3. Presentation層でUseCaseを作成時にリポジトリを注入
```

#### 使用例

```typescript
// Presentation層（App.tsx など）
const repository = container.getTodoRepository();
const useCase = new GetTodosUseCase(repository);
const todos = await useCase.execute();
```

#### 実装の切り替え

```typescript
// テスト時
const mockRepository = new MockTodoRepository();
container.setTodoRepository(mockRepository);

// API実装への切り替え
const apiRepository = new ApiTodoRepository();
container.setTodoRepository(apiRepository);

// または container.ts を直接編集
private constructor() {
  this.todoRepository = new ApiTodoRepository(); // 変更はここだけ
}
```

---

## ユースケース間の関係

### 依存関係

```
GetTodosUseCase
    ↓ 依存
TodoRepository (interface)
    ↑ 実装
LocalStorageTodoRepository

UpdateTodoStatusUseCase
    ↓ 依存
TodoRepository (interface)
    ↑ 実装
LocalStorageTodoRepository

UpdateTodoAssigneeUseCase
    ↓ 依存
TodoRepository (interface)
    ↑ 実装
LocalStorageTodoRepository
```

### 共通パターン

すべてのUseCaseは同じ構造：
1. リポジトリをコンストラクタで受け取る
2. `execute()`メソッドで処理を実行
3. 戻り値は`Promise`

---

## エラーハンドリング戦略

### 現在の実装

- **Todoが見つからない**: `Error`をスロー
- **リポジトリエラー**: 例外を伝播
- **ログ出力**: リポジトリ層で実施

### 将来の改善

1. **カスタム例外クラス**
```typescript
class TodoNotFoundError extends Error {
  constructor(todoId: string) {
    super(`Todo not found: ${todoId}`);
    this.name = 'TodoNotFoundError';
  }
}
```

2. **Result型パターン**
```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

async execute(): Promise<Result<Todo[], Error>> {
  try {
    const todos = await this.todoRepository.findAll();
    return { ok: true, value: todos };
  } catch (error) {
    return { ok: false, error };
  }
}
```

3. **リトライロジック**
```typescript
async execute(): Promise<Todo[]> {
  let retries = 3;
  while (retries > 0) {
    try {
      return await this.todoRepository.findAll();
    } catch (error) {
      retries--;
      if (retries === 0) throw error;
      await delay(1000);
    }
  }
}
```

---

## トランザクション管理（将来）

### 複数操作の一貫性

```typescript
export class CompleteTodoUseCase {
  async execute(todoId: string): Promise<void> {
    // トランザクション開始
    await this.unitOfWork.begin();

    try {
      // 1. Todoの状態を完了に変更
      const todo = await this.todoRepository.findById(todoId);
      const completed = todo.updateStatus('completed');
      await this.todoRepository.update(completed);

      // 2. 完了時刻を記録（将来の機能）
      await this.activityRepository.create({
        todoId,
        action: 'completed',
        timestamp: new Date(),
      });

      // コミット
      await this.unitOfWork.commit();
    } catch (error) {
      // ロールバック
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
```

---

## Application層の利点

✅ **ビジネスロジックの集約**: アプリケーション固有のロジックがここに
✅ **テストの容易性**: リポジトリをモック化してテスト可能
✅ **再利用性**: 複数のUIから同じUseCaseを利用可能
✅ **保守性**: UseCaseごとに独立して変更可能
✅ **明確な責務**: 各UseCaseの役割が明確

---

## 設計原則の適用

### 1. 単一責任の原則（SRP）
- 各UseCaseは1つの責務のみ
- `GetTodosUseCase`は取得のみ
- `UpdateTodoStatusUseCase`は状態更新のみ

### 2. 依存性逆転の原則（DIP）
- UseCaseは`TodoRepository`インターフェースに依存
- 具体的な実装には依存しない

### 3. オープン・クローズドの原則（OCP）
- 新しいUseCaseの追加が容易
- 既存のUseCaseを変更せずに拡張可能

---

## 将来の拡張

### 1. 新しいUseCaseの追加

```typescript
// Todo作成
export class CreateTodoUseCase {
  async execute(title: string, assigneeId?: string): Promise<Todo> {
    // バリデーション
    if (!title || title.length === 0) {
      throw new Error('Title is required');
    }

    // 新しいTodoを作成
    const todo = new Todo(
      generateId(),
      title,
      'pending',
      assigneeId ? await this.findAssignee(assigneeId) : null
    );

    // 保存
    await this.todoRepository.create(todo);
    return todo;
  }
}

// Todo削除
export class DeleteTodoUseCase {
  async execute(todoId: string): Promise<void> {
    await this.todoRepository.delete(todoId);
  }
}
```

### 2. バリデーション層の追加

```typescript
export class UpdateTodoStatusUseCase {
  async execute(todoId: string, newStatus: TodoStatus): Promise<void> {
    // バリデーション
    await this.validator.validate({
      todoId,
      newStatus,
    });

    // ビジネスロジック
    const todo = await this.todoRepository.findById(todoId);
    if (!todo) throw new TodoNotFoundError(todoId);

    const updatedTodo = todo.updateStatus(newStatus);
    await this.todoRepository.update(updatedTodo);
  }
}
```

### 3. イベント駆動アーキテクチャ

```typescript
export class UpdateTodoStatusUseCase {
  async execute(todoId: string, newStatus: TodoStatus): Promise<void> {
    const todo = await this.todoRepository.findById(todoId);
    const updatedTodo = todo.updateStatus(newStatus);
    await this.todoRepository.update(updatedTodo);

    // イベント発行
    await this.eventBus.publish(new TodoStatusChangedEvent(todoId, newStatus));
  }
}
```

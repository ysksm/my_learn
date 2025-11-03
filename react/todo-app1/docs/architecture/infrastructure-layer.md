# Infrastructure層

## 概要

Infrastructure層は、外部リソース（データベース、API、ストレージなど）へのアクセスを担当します。Domain層で定義されたリポジトリインターフェースを実装し、具体的なデータ永続化の詳細を提供します。

## 責務

- リポジトリインターフェースの実装
- データの永続化と取得
- 外部システムとの統合
- データのシリアライズ/デシリアライズ

## ファイル構成

```
src/infrastructure/
└── repositories/
    └── LocalStorageTodoRepository.ts  # LocalStorage実装
```

---

## LocalStorageTodoRepository.ts

### 目的
`TodoRepository`インターフェースのLocalStorage実装を提供

### クラス定義

```typescript
export class LocalStorageTodoRepository implements TodoRepository {
  private todos: Todo[];

  constructor() {
    this.todos = this.loadFromStorage();
    if (this.todos.length === 0) {
      this.todos = this.getInitialData();
      this.saveToStorage();
    }
  }

  async findAll(): Promise<Todo[]>
  async findById(id: string): Promise<Todo | null>
  async update(todo: Todo): Promise<void>
}
```

### 設計パターン

#### 1. Repository Pattern の実装
Domain層の`TodoRepository`インターフェースを実装

#### 2. Singleton（部分的）
DIコンテナから1つのインスタンスのみが生成される

### プロパティ

#### `private todos: Todo[]`
- メモリ上のキャッシュ
- LocalStorageとの同期に使用
- **重要**: 毎回LocalStorageから再読み込み（複数タブ同期のため）

---

## メソッド詳細

### 1. constructor()

#### 目的
初期化時にデータを読み込み、必要に応じて初期データを作成

#### 処理フロー
```typescript
constructor() {
  // 1. LocalStorageからデータ読み込み
  this.todos = this.loadFromStorage();

  // 2. データが空なら初期データをセット
  if (this.todos.length === 0) {
    this.todos = this.getInitialData();
    this.saveToStorage();
  }
}
```

#### 初期データ
```typescript
- レイヤードアーキテクチャの設計（完了、田中太郎）
- Domain層の実装（進行中、佐藤花子）
- ポーリング機能の実装（未着手、田中太郎）
- UI実装（未着手、佐藤花子）
```

---

### 2. findAll(): Promise<Todo[]>

#### 目的
すべてのTodoを取得

#### 実装

```typescript
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
    (todo) => new Todo(...)
  );
}
```

#### 重要な設計判断

##### a. 毎回LocalStorageから読み込む理由
**問題**: 複数タブで開いている場合、他のタブでの変更を検知できない

**解決策**:
- 毎回`loadFromStorage()`を呼び出す
- 最新のデータを常に取得
- 5秒のポーリング間隔で自動同期

##### b. 新しいインスタンスを返す理由
**問題**: 同じインスタンスを返すとReactが変更を検知できない

**解決策**:
- 毎回`new Todo()`で新しいインスタンスを作成
- Reactの差分検出が正しく動作
- イミュータブルパターンに準拠

---

### 3. findById(id: string): Promise<Todo | null>

#### 目的
指定されたIDのTodoを取得

#### 実装

```typescript
async findById(id: string): Promise<Todo | null> {
  await this.delay(50);
  // 毎回LocalStorageから最新のデータを読み込む
  this.todos = this.loadFromStorage();
  const todo = this.todos.find((t) => t.id === id);
  if (!todo) return null;
  // 新しいインスタンスを作成して返す
  return new Todo(...);
}
```

#### 戻り値
- 見つかった場合: 新しい`Todo`インスタンス
- 見つからない場合: `null`

---

### 4. update(todo: Todo): Promise<void>

#### 目的
Todoを更新してLocalStorageに保存

#### 実装

```typescript
async update(todo: Todo): Promise<void> {
  await this.delay(50);
  // 更新前に最新のデータを読み込む（複数タブ同期のため）
  this.todos = this.loadFromStorage();
  const index = this.todos.findIndex((t) => t.id === todo.id);
  if (index !== -1) {
    console.log('[LocalStorage] Todo更新:', { ... });
    this.todos[index] = todo;
    this.saveToStorage();
    console.log('[LocalStorage] 更新後のデータ:', ...);
  }
}
```

#### 処理フロー
1. 最新のデータを読み込み
2. 該当するTodoを検索
3. 配列を更新
4. LocalStorageに保存
5. ログ出力（デバッグ用）

---

## プライベートメソッド

### 1. saveToStorage(): void

#### 目的
todosをLocalStorageに保存

#### 実装

```typescript
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
```

#### シリアライズ形式

```typescript
interface SerializedTodo {
  id: string;
  title: string;
  status: TodoStatus;
  assignee: { id: string; name: string } | null;
}
```

#### 保存先
- **キー**: `'todo-app-data'`
- **形式**: JSON文字列
- **場所**: `localStorage`（ブラウザ依存）

---

### 2. loadFromStorage(): Todo[]

#### 目的
LocalStorageからデータを読み込み、Todoインスタンスに変換

#### 実装

```typescript
private loadFromStorage(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('[LocalStorage] データが見つかりません。初期化します。');
      return [];
    }

    const serialized: SerializedTodo[] = JSON.parse(data);
    const todos = serialized.map(
      (item) => new Todo(
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
```

#### デシリアライズの流れ
1. LocalStorageから文字列を取得
2. JSONパース
3. 各要素を`Todo`インスタンスに変換
4. `Assignee`も復元
5. ログ出力

---

### 3. getInitialData(): Todo[]

#### 目的
初回起動時のサンプルデータを生成

#### 実装

```typescript
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
```

---

### 4. delay(ms: number): Promise<void>

#### 目的
非同期処理をシミュレート

#### 実装

```typescript
private delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

#### 使用理由
1. 実際のAPI通信に近い動作
2. ローディング状態のテスト
3. 将来的なAPI実装への移行が容易

---

## データフロー

### 保存フロー
```
TodoItem変更
  ↓
UpdateTodoStatusUseCase
  ↓
LocalStorageTodoRepository.update()
  ↓
this.todos[index] = todo  （メモリ更新）
  ↓
saveToStorage()  （永続化）
  ↓
localStorage.setItem('todo-app-data', JSON)
```

### 読み込みフロー
```
App.tsx (fetchTodos)
  ↓
GetTodosUseCase.execute()
  ↓
LocalStorageTodoRepository.findAll()
  ↓
loadFromStorage()  （最新データ取得）
  ↓
localStorage.getItem('todo-app-data')
  ↓
JSON.parse() + デシリアライズ
  ↓
新しいTodoインスタンス配列を返す
```

---

## 複数タブ同期の仕組み

### 課題
複数のブラウザタブで開いた場合、データの同期が必要

### 解決策

#### 1. 読み込み時に毎回LocalStorageを確認
```typescript
async findAll(): Promise<Todo[]> {
  // 常に最新のデータを取得
  this.todos = this.loadFromStorage();
  // ...
}
```

#### 2. ポーリング（Presentation層）
- 5秒ごとに`findAll()`を呼び出し
- 最新のデータを取得
- UIを更新

#### 3. Storage Event（Presentation層）
- 他のタブでLocalStorageが変更されたらイベント発火
- 即座にデータを再取得
- 5秒待たずに同期

### タイムライン

```
タブA: ユーザーが状態変更
  ↓ (即座)
タブA: LocalStorageに保存
  ↓ (即座)
タブB: storage eventを検知
  ↓ (即座)
タブB: findAll()で最新データ取得
  ↓
タブB: UI更新

または

タブA: ユーザーが状態変更
  ↓ (即座)
タブA: LocalStorageに保存
  ↓ (最大5秒待機)
タブB: ポーリングでfindAll()実行
  ↓
タブB: 最新データ取得
  ↓
タブB: UI更新
```

---

## 設計の利点

✅ **依存性逆転の実現**: Domain層に依存せず、実装を提供
✅ **実装の交換可能性**: APIリポジトリへの切り替えが容易
✅ **複数タブ対応**: 毎回読み込むことで同期を実現
✅ **React親和性**: 新しいインスタンスで変更検知が確実
✅ **デバッグ容易性**: ログ出力で動作を追跡可能

---

## 将来の拡張

### 1. API実装への移行

```typescript
export class ApiTodoRepository implements TodoRepository {
  async findAll(): Promise<Todo[]> {
    const response = await fetch('/api/todos');
    const data = await response.json();
    return data.map(item => new Todo(...));
  }

  async update(todo: Todo): Promise<void> {
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    });
  }
}
```

切り替え方法: `container.ts`で1行変更するだけ

### 2. IndexedDB実装

- より大容量のデータに対応
- オフライン対応の強化
- 複雑なクエリのサポート

### 3. キャッシュ戦略

- ネットワーク優先
- キャッシュ優先
- ストール・ワイル・リバリデート

### 4. 楽観的更新

- UI即座更新
- バックグラウンドで保存
- エラー時にロールバック

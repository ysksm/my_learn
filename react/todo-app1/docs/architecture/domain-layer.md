# Domain層

## 概要

Domain層はアプリケーションの中核であり、ビジネスロジックとビジネスルールを表現します。他のどの層にも依存せず、最も安定した層です。

## 責務

- ビジネスエンティティの定義
- バリューオブジェクトの定義
- ビジネスルールのカプセル化
- リポジトリインターフェースの定義（実装は含まない）

## ファイル構成

```
src/domain/
├── models/
│   ├── Todo.ts          # Todoエンティティ
│   ├── TodoStatus.ts    # ステータス型定義
│   └── Assignee.ts      # 担当者バリューオブジェクト
└── repositories/
    └── TodoRepository.ts # リポジトリインターフェース
```

---

## 1. TodoStatus.ts

### 目的
Todoの状態を型安全に表現する

### 型定義

```typescript
export type TodoStatus = 'pending' | 'in_progress' | 'completed';
```

### 定数

```typescript
export const TodoStatuses = {
  PENDING: 'pending' as TodoStatus,
  IN_PROGRESS: 'in_progress' as TodoStatus,
  COMPLETED: 'completed' as TodoStatus,
} as const;
```

### 設計判断
- Union型で状態を限定し、不正な値を防ぐ
- 定数オブジェクトで再利用可能な値を提供
- 文字列リテラル型により、JSONとの相互変換が容易

---

## 2. Assignee.ts

### 目的
担当者を表現するバリューオブジェクト

### クラス定義

```typescript
export class Assignee {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  equals(other: Assignee): boolean {
    return this.id === other.id;
  }
}
```

### 設計パターン: Value Object

**特徴**:
- イミュータブル（`readonly`）
- IDによる等価性判定
- 自己完結したオブジェクト

**バリューオブジェクトである理由**:
- ライフサイクルがTodoに依存
- IDで一意に識別される
- 不変性が重要（変更するなら新しいインスタンスを作成）

### メソッド

#### `equals(other: Assignee): boolean`
- 2つの担当者が同一かを判定
- IDベースの比較

---

## 3. Todo.ts

### 目的
Todoを表現するエンティティ（ドメインモデルの中心）

### クラス定義

```typescript
export class Todo {
  readonly id: string;
  readonly title: string;
  readonly status: TodoStatus;
  readonly assignee: Assignee | null;

  constructor(
    id: string,
    title: string,
    status: TodoStatus,
    assignee: Assignee | null
  ) {
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
```

### 設計パターン: Entity

**特徴**:
- IDで一意に識別
- イミュータブル（不変性）
- ビジネスロジックをカプセル化

**エンティティである理由**:
- 独自のライフサイクルを持つ
- IDによる識別が重要
- 状態の変更を追跡する必要がある

### プロパティ

| プロパティ | 型 | 説明 |
|----------|-----|------|
| `id` | `string` | 一意識別子 |
| `title` | `string` | Todoのタイトル |
| `status` | `TodoStatus` | 状態（未着手/進行中/完了） |
| `assignee` | `Assignee \| null` | 担当者（未割当の場合はnull） |

### メソッド

#### `updateStatus(newStatus: TodoStatus): Todo`
- 状態を更新した新しいTodoインスタンスを返す
- イミュータブルパターン
- 元のオブジェクトは変更しない

#### `updateAssignee(newAssignee: Assignee | null): Todo`
- 担当者を更新した新しいTodoインスタンスを返す
- イミュータブルパターン

#### `isCompleted(): boolean`
- Todoが完了状態かを判定
- ビジネスロジックのカプセル化

### 設計判断

**イミュータブルにした理由**:
1. **予測可能性**: オブジェクトが勝手に変わらない
2. **スレッドセーフ**: 複数箇所から安全に参照可能
3. **React親和性**: 状態変更の検知が容易
4. **履歴管理**: 過去の状態を保持しやすい

---

## 4. TodoRepository.ts

### 目的
Todoのデータアクセスに関する契約（インターフェース）を定義

### インターフェース定義

```typescript
export interface TodoRepository {
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | null>;
  update(todo: Todo): Promise<void>;
}
```

### 設計パターン: Repository Pattern

**目的**:
- データアクセスロジックをドメインロジックから分離
- 永続化の詳細を隠蔽
- テストでモック化が容易

### メソッド仕様

#### `findAll(): Promise<Todo[]>`
- すべてのTodoを取得
- 空配列を返す可能性あり
- エラー時は例外をスロー

#### `findById(id: string): Promise<Todo | null>`
- 指定されたIDのTodoを取得
- 存在しない場合は`null`を返す
- エラー時は例外をスロー

#### `update(todo: Todo): Promise<void>`
- Todoを更新
- 該当するTodoが存在しない場合の動作は実装に依存
- エラー時は例外をスロー

### 依存性逆転の原則（DIP）

```
Application層（上位）
    ↓ 依存
Domain層（インターフェース定義）
    ↑ 実装
Infrastructure層（下位）
```

- **Domain層**がインターフェースを定義
- **Infrastructure層**が実装を提供
- **Application層**はインターフェースのみに依存

---

## ドメインモデルの関係

```
┌──────────────────┐
│      Todo        │ Entity
├──────────────────┤
│ - id             │
│ - title          │
│ - status         │
│ - assignee       │
├──────────────────┤
│ + updateStatus() │
│ + updateAssignee()│
│ + isCompleted()  │
└────────┬─────────┘
         │ 0..1
         │ 持つ
         ↓
┌──────────────────┐
│    Assignee      │ Value Object
├──────────────────┤
│ - id             │
│ - name           │
├──────────────────┤
│ + equals()       │
└──────────────────┘

         ↕︎ 使用
┌──────────────────┐
│   TodoStatus     │ Type
├──────────────────┤
│ - pending        │
│ - in_progress    │
│ - completed      │
└──────────────────┘
```

## ビジネスルール

### 1. Todo の状態遷移
- `pending` → `in_progress` → `completed`
- 任意の状態間での遷移が可能（現在の実装）
- 将来的に状態遷移ルールを厳密化可能

### 2. 担当者の割り当て
- 1つのTodoに最大1人の担当者
- 未割当（null）も許可

### 3. 不変性の保証
- すべてのエンティティとバリューオブジェクトはイミュータブル
- 変更は新しいインスタンスの作成で表現

## Domain層の利点

✅ **ビジネスロジックの集約**: すべてのビジネスルールがここに集約
✅ **技術的詳細からの独立**: UIやDBに依存しない
✅ **テスト容易性**: 外部依存なしでテスト可能
✅ **再利用性**: 他のアプリケーションでも利用可能
✅ **保守性**: ビジネスルールの変更が局所化

## 将来の拡張

### 追加検討事項
1. **バリデーション**: タイトルの長さ制限など
2. **状態遷移ルール**: 不正な遷移を防ぐ
3. **期限管理**: 期限（dueDate）の追加
4. **優先度**: 優先度（priority）の追加
5. **タグ機能**: 複数のタグを持てるようにする

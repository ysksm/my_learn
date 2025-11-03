# 実装計画書

## ディレクトリ構造

```
src/
├── domain/              # ドメイン層
│   ├── models/         # エンティティ・バリューオブジェクト
│   │   ├── Todo.ts
│   │   ├── TodoStatus.ts
│   │   └── Assignee.ts
│   └── repositories/   # リポジトリインターフェース
│       └── TodoRepository.ts
├── application/        # アプリケーション層
│   ├── usecases/      # ユースケース
│   │   ├── GetTodosUseCase.ts
│   │   ├── UpdateTodoStatusUseCase.ts
│   │   └── UpdateTodoAssigneeUseCase.ts
│   └── di/            # DIコンテナ
│       └── container.ts
├── infrastructure/     # インフラ層
│   └── repositories/  # リポジトリ実装（モック）
│       └── MockTodoRepository.ts
└── presentation/       # プレゼンテーション層
    ├── components/    # Reactコンポーネント
    │   ├── TodoList.tsx
    │   ├── TodoItem.tsx
    │   └── AssigneeSelector.tsx
    ├── hooks/        # カスタムフック
    │   └── useTodoPolling.ts
    └── App.tsx

```

## レイヤーの役割

### Domain層
- ビジネスロジックとルールを定義
- 他のレイヤーに依存しない
- エンティティ、バリューオブジェクト、リポジトリインターフェースを含む

**実装内容:**
- `Todo`: id, title, status, assigneeを持つエンティティ
- `TodoStatus`: "pending" | "in_progress" | "completed"
- `Assignee`: name, idを持つバリューオブジェクト
- `TodoRepository`: findAll(), findById(), update()メソッドのインターフェース

### Infrastructure層
- 外部リソースへのアクセスを担当
- ドメイン層のリポジトリインターフェースを実装

**実装内容:**
- `MockTodoRepository`:
  - メモリ上にサンプルデータを保持
  - 3-5件のモックTodoを返す
  - update時はメモリ上のデータを更新
  - 非同期処理をシミュレート（Promise使用）

### Application層
- ユースケースを実装
- DIによりリポジトリを注入
- ドメインロジックを組み合わせてアプリケーション機能を実現

**実装内容:**
- `GetTodosUseCase`: 全Todo取得
- `UpdateTodoStatusUseCase`: 状態更新
- `UpdateTodoAssigneeUseCase`: 担当者更新
- `container`: DIコンテナ設定

### Presentation層
- Reactコンポーネント
- ユーザーインターフェース
- Application層のユースケースを呼び出し

**実装内容:**
- `TodoList`: Todo一覧表示
- `TodoItem`: 個別Todo表示・操作
- `AssigneeSelector`: 担当者選択UI
- `useTodoPolling`: ポーリング機能のカスタムフック

## 実装ステップ

### Step 1: Domain層の実装
**ファイル:**
- `src/domain/models/TodoStatus.ts`
- `src/domain/models/Assignee.ts`
- `src/domain/models/Todo.ts`
- `src/domain/repositories/TodoRepository.ts`

**動作確認:** TypeScriptのコンパイルが通ることを確認

### Step 2: Infrastructure層の実装
**ファイル:**
- `src/infrastructure/repositories/MockTodoRepository.ts`

**動作確認:** モックデータが正しく返されることをコンソールで確認

### Step 3: Application層（DI + ユースケース）
**ファイル:**
- `src/application/di/container.ts`
- `src/application/usecases/GetTodosUseCase.ts`

**動作確認:** ユースケース経由でモックデータが取得できることを確認

### Step 4: Presentation層（Todo一覧表示）
**ファイル:**
- `src/presentation/components/TodoList.tsx`
- `src/presentation/components/TodoItem.tsx`
- `src/presentation/App.tsx`

**動作確認:** ブラウザでTodo一覧が表示される

### Step 5: ポーリング機能
**ファイル:**
- `src/presentation/hooks/useTodoPolling.ts`

**動作確認:** 5秒ごとにデータが更新される（コンソールログで確認）

### Step 6: 状態更新機能
**ファイル:**
- `src/application/usecases/UpdateTodoStatusUseCase.ts`
- `src/presentation/components/TodoItem.tsx`（更新）

**動作確認:** チェックボックスでTodoの状態が変更できる

### Step 7: 担当者更新機能
**ファイル:**
- `src/application/usecases/UpdateTodoAssigneeUseCase.ts`
- `src/presentation/components/AssigneeSelector.tsx`
- `src/presentation/components/TodoItem.tsx`（更新）

**動作確認:** セレクトボックスで担当者が変更できる

## 依存性の方向

```
Presentation層
    ↓ 依存
Application層
    ↓ 依存
Domain層
    ↑ 実装
Infrastructure層
```

- 上位層は下位層のインターフェースに依存
- Infrastructure層はDomain層のインターフェースを実装
- DIにより実行時に具体的な実装を注入

## モックデータの例

```typescript
const mockTodos = [
  {
    id: '1',
    title: 'レイヤードアーキテクチャの設計',
    status: 'completed',
    assignee: { id: 'u1', name: '田中太郎' }
  },
  {
    id: '2',
    title: 'Domain層の実装',
    status: 'in_progress',
    assignee: { id: 'u2', name: '佐藤花子' }
  },
  {
    id: '3',
    title: 'ポーリング機能の実装',
    status: 'pending',
    assignee: { id: 'u1', name: '田中太郎' }
  }
]
```

## 次のステップ（将来の拡張）

- モックリポジトリを実際のAPI通信に置き換え
- エラーハンドリングの追加
- ローディング状態の表示
- Todo追加・削除機能
- フィルタリング・ソート機能

# Presentation層

## 概要

Presentation層は、ユーザーインターフェース（UI）とユーザーインタラクションを担当します。React 19を使用し、UseCaseを通じてApplication層とやり取りし、ビジネスロジックには直接依存しません。

## 責務

- UIのレンダリング
- ユーザー入力の処理
- UseCaseの呼び出し
- 状態管理（ローカルUI状態）
- ポーリングによるデータ同期
- 複数タブ間のデータ同期

## ファイル構成

```
src/
├── App.tsx                                   # ルートコンポーネント
├── App.css                                   # スタイル
└── presentation/
    └── components/
        ├── TodoList.tsx                      # Todo一覧表示
        ├── TodoItem.tsx                      # Todo個別アイテム
        └── AssigneeSelector.tsx              # 担当者選択ドロップダウン
```

---

## App.tsx

### 目的
アプリケーションのルートコンポーネント。ポーリングとストレージイベントを管理し、データ同期を実現します。

### コンポーネント定義

```typescript
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTodos = useCallback(async () => {
    // UseCaseを使ってTodoを取得
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    const fetchedTodos = await getTodosUseCase.execute();
    setTodos([...fetchedTodos]); // 新しい配列参照を作成
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // ポーリング（5秒間隔）
  useEffect(() => {
    fetchTodos();
    const intervalId = setInterval(fetchTodos, 5000);
    return () => clearInterval(intervalId);
  }, [fetchTodos]);

  // Storage Event（複数タブ同期）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todo-app-data' || e.key === null) {
        fetchTodos();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchTodos]);

  return (
    <div>
      <h1>Todo アプリケーション</h1>
      {lastUpdated && <p>最終更新: {lastUpdated.toLocaleTimeString()}</p>}
      {loading ? <p>読み込み中...</p> : <TodoList todos={todos} onUpdate={fetchTodos} />}
    </div>
  );
}
```

---

## 主要な機能

### 1. 状態管理

#### State定義

| State | 型 | 目的 |
|-------|-----|------|
| `todos` | `Todo[]` | Todo一覧データ |
| `loading` | `boolean` | 初回読み込み中フラグ |
| `lastUpdated` | `Date \| null` | 最終更新時刻 |

#### 状態更新の重要ポイント

```typescript
setTodos([...fetchedTodos]); // 新しい配列参照を作成
```

**理由**:
- Reactの差分検出は参照の変化を見る
- 同じ配列インスタンスだと変更を検知しない
- スプレッド演算子で新しい配列を作成することで、確実に再レンダリング

---

### 2. データ取得（fetchTodos）

#### 実装

```typescript
const fetchTodos = useCallback(async () => {
  try {
    console.log('[fetchTodos] データ取得開始');
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    const fetchedTodos = await getTodosUseCase.execute();
    setTodos([...fetchedTodos]);
    setLastUpdated(new Date());
    setLoading(false);
  } catch (error) {
    console.error('[Polling] エラー:', error);
  }
}, []);
```

#### 処理フロー

```
1. DIコンテナからリポジトリを取得
   ↓
2. GetTodosUseCaseを作成
   ↓
3. execute()でTodoを取得
   ↓
4. 新しい配列参照でstateを更新
   ↓
5. 最終更新時刻を記録
```

#### useCallbackを使用する理由
- `fetchTodos`がuseEffectの依存配列に含まれる
- 再作成を防ぐことで無限ループを回避
- パフォーマンスの最適化

---

### 3. ポーリング機能

#### 実装

```typescript
useEffect(() => {
  fetchTodos();                                // 初回実行
  const intervalId = setInterval(fetchTodos, 5000); // 5秒ごと
  return () => clearInterval(intervalId);      // クリーンアップ
}, [fetchTodos]);
```

#### 動作

- **初回**: コンポーネントマウント時に即座に実行
- **定期実行**: 5秒（5000ms）ごとに`fetchTodos`を実行
- **クリーンアップ**: アンマウント時にインターバルをクリア

#### 設計判断

**なぜポーリング？**
- LocalStorageはリアルタイム通知機能なし
- 定期的にチェックすることで最新データを取得
- 複数タブ間での変更を検知

**5秒間隔の理由**
- ユーザーに変更を素早く反映（5秒以内）
- サーバー負荷を考慮（将来API実装時）
- バッテリー消費とUXのバランス

---

### 4. Storage Event（複数タブ同期）

#### 実装

```typescript
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'todo-app-data' || e.key === null) {
      console.log('[Storage Event] 他のタブでデータが変更されました。再読み込みします。');
      fetchTodos();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [fetchTodos]);
```

#### Storage Eventとは

ブラウザの`storage`イベントは、**同じオリジンの他のタブ**でLocalStorageが変更されたときに発火します。

**重要**: 変更を行ったタブ自身ではイベントは発火しない。

#### 処理条件

```typescript
if (e.key === 'todo-app-data' || e.key === null)
```

- `e.key === 'todo-app-data'`: 該当キーが変更された
- `e.key === null`: `localStorage.clear()`が呼ばれた

#### タイムライン

```
タブA: ユーザーがTodo状態を変更
   ↓ (即座)
タブA: LocalStorageに保存
   ↓ (即座、ブラウザが自動発火)
タブB: storage eventを受信
   ↓ (即座)
タブB: fetchTodos()実行
   ↓
タブB: UI更新（変更が反映される）
```

#### ポーリングとの違い

| 方式 | 遅延 | タイミング | 用途 |
|------|------|-----------|------|
| Storage Event | 即座（~数ms） | 変更時のみ | リアルタイム同期 |
| ポーリング | 最大5秒 | 定期的 | フォールバック、定期更新 |

**両方を実装する理由**:
- Storage Eventで即座に同期
- ポーリングでフォールバック（イベント失敗時や、外部変更時）

---

## TodoList.tsx

### 目的
Todo一覧を表示するコンポーネント

### コンポーネント定義

```typescript
interface TodoListProps {
  todos: Todo[];
  onUpdate: () => void;
}

export function TodoList({ todos, onUpdate }: TodoListProps) {
  useEffect(() => {
    console.log('[TodoList] 再レンダリング、Todo数:', todos.length);
  }, [todos]);

  if (todos.length === 0) {
    return <p>Todoがありません</p>;
  }

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} />
      ))}
    </div>
  );
}
```

### Props

| Prop | 型 | 説明 |
|------|-----|------|
| `todos` | `Todo[]` | 表示するTodo一覧 |
| `onUpdate` | `() => void` | Todo更新後のコールバック |

### 責務

- Todo配列のレンダリング
- 空状態の表示
- 各TodoをTodoItemコンポーネントに渡す
- デバッグログ出力

### 設計パターン: Container/Presentational Pattern

**TodoList**は**Presentationalコンポーネント**:
- データを受け取り、表示のみ
- ロジックを持たない
- 再利用可能

---

## TodoItem.tsx

### 目的
個別のTodoアイテムを表示し、状態と担当者の更新を処理

### コンポーネント定義

```typescript
interface TodoItemProps {
  todo: Todo;
  onUpdate: () => void;
}

export function TodoItem({ todo, onUpdate }: TodoItemProps) {
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TodoStatus;
    const updateStatusUseCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
    await updateStatusUseCase.execute(todo.id, newStatus);
    onUpdate();
  };

  const handleAssigneeChange = async (newAssignee: Assignee | null) => {
    const updateAssigneeUseCase = new UpdateTodoAssigneeUseCase(
      container.getTodoRepository()
    );
    await updateAssigneeUseCase.execute(todo.id, newAssignee);
    onUpdate();
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: '12px', marginBottom: '8px' }}>
      <h3>{todo.title}</h3>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div>
          <label>状態:</label>
          <select value={todo.status} onChange={handleStatusChange}>
            <option value="pending">⏳ 未着手</option>
            <option value="in_progress">🔄 進行中</option>
            <option value="completed">✅ 完了</option>
          </select>
        </div>
        <div>
          <label>担当:</label>
          <AssigneeSelector currentAssignee={todo.assignee} onChange={handleAssigneeChange} />
        </div>
      </div>
    </div>
  );
}
```

### Props

| Prop | 型 | 説明 |
|------|-----|------|
| `todo` | `Todo` | 表示するTodo |
| `onUpdate` | `() => void` | 更新完了後のコールバック |

---

## イベントハンドラ

### 1. handleStatusChange

#### 目的
Todoの状態を変更する

#### 処理フロー

```
1. selectの変更イベントを受け取る
   ↓
2. 新しい状態値を取得（TodoStatusにキャスト）
   ↓
3. UpdateTodoStatusUseCaseを作成
   ↓
4. execute()で状態を更新
   ↓
5. onUpdate()を呼び出してApp.tsxに通知
   ↓
6. App.tsx が fetchTodos() を実行
   ↓
7. UI全体が最新データで更新
```

#### コード

```typescript
const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const newStatus = e.target.value as TodoStatus;
  console.log('[TodoItem] 状態変更開始:', { id: todo.id, oldStatus: todo.status, newStatus });
  const updateStatusUseCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
  await updateStatusUseCase.execute(todo.id, newStatus);
  console.log('[TodoItem] 状態変更完了、onUpdate()呼び出し');
  onUpdate();
};
```

#### 非同期処理

- `async/await`を使用
- UseCaseの処理が完了するまで待機
- 完了後に`onUpdate()`でUIを更新

---

### 2. handleAssigneeChange

#### 目的
Todoの担当者を変更する

#### 処理フロー

```
1. AssigneeSelectorから新しい担当者を受け取る
   ↓
2. UpdateTodoAssigneeUseCaseを作成
   ↓
3. execute()で担当者を更新
   ↓
4. onUpdate()を呼び出してApp.tsxに通知
```

#### コード

```typescript
const handleAssigneeChange = async (newAssignee: Assignee | null) => {
  console.log('[TodoItem] 担当者変更開始:', {
    id: todo.id,
    oldAssignee: todo.assignee?.name,
    newAssignee: newAssignee?.name
  });
  const updateAssigneeUseCase = new UpdateTodoAssigneeUseCase(
    container.getTodoRepository()
  );
  await updateAssigneeUseCase.execute(todo.id, newAssignee);
  console.log('[TodoItem] 担当者変更完了、onUpdate()呼び出し');
  onUpdate();
};
```

#### null許容

- `newAssignee`は`null`を許容
- `null`の場合は「未割当」を表す

---

## AssigneeSelector.tsx

### 目的
担当者を選択するドロップダウンコンポーネント

### コンポーネント定義

```typescript
interface AssigneeSelectorProps {
  currentAssignee: Assignee | null;
  onChange: (assignee: Assignee | null) => void;
}

const availableAssignees = [
  new Assignee('u1', '田中太郎'),
  new Assignee('u2', '佐藤花子'),
  new Assignee('u3', '鈴木一郎'),
];

export function AssigneeSelector({ currentAssignee, onChange }: AssigneeSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange(null);
    } else {
      const assignee = availableAssignees.find((a) => a.id === value);
      if (assignee) {
        onChange(assignee);
      }
    }
  };

  return (
    <select value={currentAssignee?.id || ''} onChange={handleChange}>
      <option value="">未割当</option>
      {availableAssignees.map((assignee) => (
        <option key={assignee.id} value={assignee.id}>
          {assignee.name}
        </option>
      ))}
    </select>
  );
}
```

### Props

| Prop | 型 | 説明 |
|------|-----|------|
| `currentAssignee` | `Assignee \| null` | 現在の担当者 |
| `onChange` | `(assignee: Assignee \| null) => void` | 担当者変更時のコールバック |

---

## 担当者リスト

### 定義

```typescript
const availableAssignees = [
  new Assignee('u1', '田中太郎'),
  new Assignee('u2', '佐藤花子'),
  new Assignee('u3', '鈴木一郎'),
];
```

### 設計判断

**モックデータをコンポーネント内に持つ理由**:
1. 現在はLocalStorageのみで担当者マスタなし
2. シンプルな実装で動作確認
3. 将来的にAPIから取得する際は、Propsで渡すように変更可能

### handleChange

```typescript
const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  if (value === '') {
    onChange(null);  // 未割当
  } else {
    const assignee = availableAssignees.find((a) => a.id === value);
    if (assignee) {
      onChange(assignee);
    }
  }
};
```

#### ロジック

1. 空文字列 → `null`（未割当）
2. ID検索 → 該当する`Assignee`インスタンスを渡す

---

## データフロー全体像

### Todo更新フロー

```
[User]
  ↓ ①selectを変更
[TodoItem]
  ↓ ②handleStatusChange()
[UpdateTodoStatusUseCase]
  ↓ ③execute()
[LocalStorageTodoRepository]
  ↓ ④update()
[LocalStorage]
  ↓ ⑤保存完了
[TodoItem]
  ↓ ⑥onUpdate()
[App.tsx]
  ↓ ⑦fetchTodos()
[GetTodosUseCase]
  ↓ ⑧execute()
[LocalStorageTodoRepository]
  ↓ ⑨findAll()
[LocalStorage]
  ↓ ⑩最新データ読み込み
[App.tsx]
  ↓ ⑪setTodos([...fetchedTodos])
[TodoList → TodoItem]
  ↓ ⑫再レンダリング
[User]
  ↓ ⑬更新されたUIを確認
```

---

## 複数タブ同期のシナリオ

### シナリオ1: Storage Event（即座に同期）

```
タブA: [User] Todo状態を「進行中」に変更
       ↓
タブA: [LocalStorage] 保存
       ↓ (ブラウザが自動発火)
タブB: [window] storage event受信
       ↓
タブB: [App.tsx] handleStorageChange()
       ↓
タブB: [App.tsx] fetchTodos()
       ↓
タブB: [UI] 最新データで再レンダリング
```

**所要時間**: 数十ミリ秒

---

### シナリオ2: ポーリング（最大5秒遅延）

```
タブA: [User] Todo状態を「進行中」に変更
       ↓
タブA: [LocalStorage] 保存
       ↓
       ... (Storage Eventが何らかの理由で失敗)
       ↓ (最大5秒待機)
タブB: [setInterval] 5秒経過
       ↓
タブB: [App.tsx] fetchTodos()
       ↓
タブB: [UI] 最新データで再レンダリング
```

**所要時間**: 最大5秒

---

## 設計パターン

### 1. Container/Presentational Pattern

**Container**: `App.tsx`
- ロジックと状態管理
- UseCaseの呼び出し
- ポーリングの管理

**Presentational**: `TodoList`, `TodoItem`, `AssigneeSelector`
- UIのレンダリングのみ
- Propsで制御
- 再利用可能

### 2. Callback Pattern

親から子へコールバック関数を渡すことで、子から親へのイベント通知を実現。

```typescript
<TodoItem todo={todo} onUpdate={fetchTodos} />
```

### 3. Controlled Components

ReactがフォームのstateをコントロールするパターンのControlled Components:

```typescript
<select value={todo.status} onChange={handleStatusChange}>
```

---

## Reactの設計原則

### 1. 単一方向データフロー

```
App.tsx (state)
  ↓ Props
TodoList
  ↓ Props
TodoItem
  ↑ Callback
App.tsx (setState)
```

データは上から下へ、イベントは下から上へ。

### 2. 状態の最小化

- `todos`と`loading`のみをstateで管理
- 派生データ（例: 完了済み数）は計算で求める
- 不必要なstateを持たない

### 3. コンポーネントの責務分離

各コンポーネントは単一の責務のみ:
- `App.tsx`: データ取得とポーリング
- `TodoList`: 一覧表示
- `TodoItem`: 個別アイテムと更新
- `AssigneeSelector`: 担当者選択

---

## スタイリング

### インラインスタイル使用

```typescript
<div style={{ border: '1px solid #ddd', padding: '12px' }}>
```

**理由**:
- シンプルな実装
- 外部CSSライブラリ不要
- コンポーネント内で完結

### 将来の改善

1. **CSS Modules**: スコープ付きスタイル
2. **Tailwind CSS**: ユーティリティファースト
3. **styled-components**: CSS-in-JS
4. **MUI / Ant Design**: UIコンポーネントライブラリ

---

## ログ出力

### デバッグログの目的

アプリケーション全体で`console.log`を使用してデバッグを容易にしています。

#### 出力例

```typescript
console.log('[fetchTodos] データ取得開始');
console.log('[TodoItem] 状態変更開始:', { id, oldStatus, newStatus });
console.log('[Storage Event] 他のタブでデータが変更されました');
```

#### ログフォーマット

```
[コンポーネント/関数名] メッセージ: データ
```

---

## Presentation層の利点

✅ **UIとロジックの分離**: ビジネスロジックはApplication層に
✅ **再利用性**: コンポーネントは他の画面でも利用可能
✅ **テスタビリティ**: Propsベースでテストが容易
✅ **保守性**: 各コンポーネントの責務が明確
✅ **リアルタイム性**: ポーリング + Storage Eventで即座に同期

---

## エラーハンドリング

### 現在の実装

```typescript
try {
  const fetchedTodos = await getTodosUseCase.execute();
  setTodos([...fetchedTodos]);
} catch (error) {
  console.error('[Polling] エラー:', error);
}
```

- エラーはコンソールに出力
- UIには影響を与えない（次のポーリングで再試行）

### 将来の改善

1. **エラー表示**
```typescript
const [error, setError] = useState<string | null>(null);

if (error) {
  return <div style={{ color: 'red' }}>エラー: {error}</div>;
}
```

2. **リトライロジック**
```typescript
let retries = 3;
while (retries > 0) {
  try {
    return await getTodosUseCase.execute();
  } catch {
    retries--;
    await delay(1000);
  }
}
```

3. **トースト通知**
```typescript
toast.error('Todoの更新に失敗しました');
```

---

## パフォーマンス最適化

### 現在の実装

1. **useCallback**: `fetchTodos`の再作成を防ぐ
2. **key prop**: `todo.id`で効率的な再レンダリング
3. **条件付きレンダリング**: `loading`状態で不要な処理を回避

### 将来の改善

1. **React.memo**: コンポーネントのメモ化
```typescript
export const TodoItem = React.memo(({ todo, onUpdate }: TodoItemProps) => {
  // ...
});
```

2. **useMemo**: 重い計算のキャッシュ
```typescript
const completedCount = useMemo(() =>
  todos.filter(t => t.status === 'completed').length,
  [todos]
);
```

3. **仮想化**: 大量のTodo表示時
```typescript
import { FixedSizeList } from 'react-window';
```

---

## 将来の拡張

### 1. カスタムフック化

**useTodos.ts**:
```typescript
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    // 実装
  }, []);

  useEffect(() => {
    // ポーリングとStorage Event
  }, []);

  return { todos, loading, fetchTodos };
}
```

使用例:
```typescript
function App() {
  const { todos, loading, fetchTodos } = useTodos();
  return <TodoList todos={todos} onUpdate={fetchTodos} />;
}
```

---

### 2. ローディング状態の改善

```typescript
const [updating, setUpdating] = useState(false);

const handleStatusChange = async (newStatus: TodoStatus) => {
  setUpdating(true);
  try {
    await updateStatusUseCase.execute(todo.id, newStatus);
    onUpdate();
  } finally {
    setUpdating(false);
  }
};

return (
  <select disabled={updating} value={todo.status} onChange={handleStatusChange}>
    {/* options */}
  </select>
);
```

---

### 3. 楽観的更新（Optimistic Update）

```typescript
const handleStatusChange = async (newStatus: TodoStatus) => {
  // 1. 即座にUIを更新
  const optimisticTodo = todo.updateStatus(newStatus);
  onOptimisticUpdate(optimisticTodo);

  try {
    // 2. バックグラウンドで保存
    await updateStatusUseCase.execute(todo.id, newStatus);
  } catch (error) {
    // 3. エラー時はロールバック
    onUpdate();
  }
};
```

---

### 4. フィルタリングとソート

```typescript
const [filter, setFilter] = useState<TodoStatus | 'all'>('all');
const [sortBy, setSortBy] = useState<'title' | 'status'>('title');

const filteredTodos = useMemo(() => {
  let result = todos;
  if (filter !== 'all') {
    result = result.filter(t => t.status === filter);
  }
  return result.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
}, [todos, filter, sortBy]);
```

---

### 5. Todo作成フォーム

```typescript
function TodoCreateForm({ onCreate }: { onCreate: () => void }) {
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const createUseCase = new CreateTodoUseCase(container.getTodoRepository());
    await createUseCase.execute(title, assigneeId || null);
    onCreate();
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <AssigneeSelector currentAssignee={null} onChange={setAssigneeId} />
      <button type="submit">追加</button>
    </form>
  );
}
```

---

### 6. 状態遷移の視覚化

```typescript
function getStatusColor(status: TodoStatus): string {
  switch (status) {
    case 'pending': return '#fbbf24'; // 黄色
    case 'in_progress': return '#3b82f6'; // 青
    case 'completed': return '#10b981'; // 緑
  }
}

<div style={{
  borderLeft: `4px solid ${getStatusColor(todo.status)}`,
  padding: '12px'
}}>
  {/* content */}
</div>
```

---

## まとめ

Presentation層は以下の責務を持ちます:

1. **UIレンダリング**: Reactコンポーネント
2. **イベント処理**: ユーザー入力の受け取り
3. **UseCase呼び出し**: Application層との連携
4. **ポーリング**: 定期的なデータ同期（5秒間隔）
5. **Storage Event**: 複数タブの即座同期
6. **状態管理**: ReactのuseStateとuseEffect

これらの機能により、リアルタイムで複数タブ間のデータ同期を実現した、保守性とテスタビリティの高いUIを提供しています。

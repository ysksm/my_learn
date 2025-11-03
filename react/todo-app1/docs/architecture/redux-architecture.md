# Redux Architecture

## 概要

このアプリケーションは**Redux Toolkit**と**React Redux**を使用してグローバル状態管理を実現しています。Domain層、Application層、Infrastructure層は変更せず、Presentation層のみReduxを統合しています。

---

## Redux統合のアーキテクチャ

```
┌─────────────────────────────────┐
│   Presentation Layer            │
│                                 │
│   ┌──────────────────────┐     │
│   │   React Components   │     │
│   │   - App.tsx          │     │
│   │   - TodoList.tsx     │     │
│   │   - TodoItem.tsx     │     │
│   └──────┬───────────────┘     │
│          │ useSelector          │
│          │ useDispatch          │
│   ┌──────▼───────────────┐     │
│   │   Redux Store        │     │
│   │   - State            │     │
│   │   - Reducers         │     │
│   │   - Selectors        │     │
│   └──────┬───────────────┘     │
│          │                      │
│   ┌──────▼───────────────┐     │
│   │   Redux Thunks       │     │
│   │   (Async Actions)    │     │
│   └──────┬───────────────┘     │
└──────────┼──────────────────────┘
           │ UseCaseを呼び出し
           ↓
┌─────────────────────────────────┐
│   Application Layer             │
│   - Use Cases                   │
│   - DI Container                │
└─────────────────────────────────┘
```

---

## ファイル構成

```
src/presentation/
├── store/
│   ├── store.ts                 # Redux Store設定
│   ├── hooks.ts                 # Typed hooks (useAppDispatch, useAppSelector)
│   └── slices/
│       └── todoSlice.ts         # Todo Slice (state, reducers, thunks, selectors)
├── components/
│   ├── TodoList.tsx             # Redux接続（useAppSelector）
│   ├── TodoItem.tsx             # Redux接続（useAppDispatch）
│   └── AssigneeSelector.tsx     # 変更なし
```

---

## Redux Store (store.ts)

### 設定

```typescript
import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './slices/todoSlice';

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Todoクラスインスタンスと Date オブジェクトを許可
        ignoredActions: [
          'todo/fetchTodos/fulfilled',
          'todo/updateTodoStatus/fulfilled',
          'todo/updateTodoAssignee/fulfilled',
        ],
        ignoredPaths: ['todo.todos', 'todo.lastUpdated'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 重要な設定

#### serializableCheck

Redux Toolkitはデフォルトで、stateとactionが**シリアライズ可能**であることをチェックします。

しかし、このアプリケーションでは：
- `Todo`クラスインスタンス（エンティティ）
- `Assignee`クラスインスタンス（バリューオブジェクト）
- `Date`オブジェクト（lastUpdated）

これらは**クラスインスタンス**であり、通常のプレーンオブジェクトではありません。

**解決策**:
```typescript
serializableCheck: {
  ignoredActions: [...],  // これらのアクションのpayloadチェックをスキップ
  ignoredPaths: ['todo.todos', 'todo.lastUpdated'],  // これらのstateパスをスキップ
}
```

**なぜこの設計？**
- Domain層のエンティティをそのまま使用
- ビジネスロジック（`todo.updateStatus()`）を維持
- DDDの原則を守りながらReduxを活用

---

## Typed Hooks (hooks.ts)

### カスタムフック

```typescript
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### 利点

- **型推論**: TypeScriptが自動的に型を推論
- **補完**: IDEの自動補完が効く
- **型安全**: 間違った型を使うとコンパイルエラー

### 使用例

```typescript
// コンポーネント内
const dispatch = useAppDispatch();  // AppDispatch型
const todos = useAppSelector(selectTodos);  // Todo[]型
```

---

## Todo Slice (todoSlice.ts)

### State構造

```typescript
interface TodoState {
  todos: Todo[];              // Todo一覧
  loading: boolean;           // ローディング状態
  lastUpdated: Date | null;   // 最終更新時刻
  error: string | null;       // エラーメッセージ
}
```

### Thunks（非同期アクション）

#### 1. fetchTodos

```typescript
export const fetchTodos = createAsyncThunk('todo/fetchTodos', async () => {
  const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
  return await getTodosUseCase.execute();
});
```

**ポイント**:
- UseCaseを呼び出してビジネスロジックを実行
- Application層のGetTodosUseCaseを使用
- DIコンテナからリポジトリを取得

#### 2. updateTodoStatus

```typescript
export const updateTodoStatus = createAsyncThunk(
  'todo/updateTodoStatus',
  async ({ todoId, newStatus }: { todoId: string; newStatus: TodoStatus }) => {
    const updateStatusUseCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
    await updateStatusUseCase.execute(todoId, newStatus);

    // 更新後に最新データを取得
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    return await getTodosUseCase.execute();
  }
);
```

**ポイント**:
- 更新後に`fetchTodos`相当の処理を実行
- 最新データを返してstateを更新
- LocalStorageから最新データを取得

#### 3. updateTodoAssignee

```typescript
export const updateTodoAssignee = createAsyncThunk(
  'todo/updateTodoAssignee',
  async ({ todoId, newAssignee }: { todoId: string; newAssignee: Assignee | null }) => {
    const updateAssigneeUseCase = new UpdateTodoAssigneeUseCase(container.getTodoRepository());
    await updateAssigneeUseCase.execute(todoId, newAssignee);

    // 更新後に最新データを取得
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    return await getTodosUseCase.execute();
  }
);
```

### Reducers (extraReducers)

#### fetchTodos

```typescript
builder
  .addCase(fetchTodos.pending, (state) => {
    if (state.todos.length === 0) {
      state.loading = true;  // 初回のみローディング
    }
    state.error = null;
  })
  .addCase(fetchTodos.fulfilled, (state, action) => {
    state.loading = false;
    state.todos = action.payload;  // 取得したTodoをstateに保存
    state.lastUpdated = new Date();
    state.error = null;
  })
  .addCase(fetchTodos.rejected, (state, action) => {
    state.loading = false;
    state.error = action.error.message || 'Todoの取得に失敗しました';
  });
```

**3つの状態**:
- `pending`: リクエスト開始時
- `fulfilled`: 成功時
- `rejected`: 失敗時

#### updateTodoStatus & updateTodoAssignee

```typescript
builder
  .addCase(updateTodoStatus.fulfilled, (state, action) => {
    state.todos = action.payload;  // 更新後の最新データ
    state.lastUpdated = new Date();
  })
  .addCase(updateTodoStatus.rejected, (state, action) => {
    state.error = action.error.message || '更新に失敗しました';
  });
```

### Selectors

```typescript
export const selectTodos = (state: { todo: TodoState }) => state.todo.todos;
export const selectLoading = (state: { todo: TodoState }) => state.todo.loading;
export const selectLastUpdated = (state: { todo: TodoState }) => state.todo.lastUpdated;
export const selectError = (state: { todo: TodoState }) => state.todo.error;
```

**使用例**:
```typescript
const todos = useAppSelector(selectTodos);
const loading = useAppSelector(selectLoading);
```

---

## コンポーネント統合

### main.tsx

```typescript
import { Provider } from 'react-redux';
import { store } from './presentation/store/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
```

**ポイント**:
- `Provider`でアプリ全体をラップ
- すべての子コンポーネントがRedux Storeにアクセス可能

---

### App.tsx

```typescript
import { useAppDispatch, useAppSelector } from './presentation/store/hooks';
import { fetchTodos, selectLoading, selectLastUpdated, selectError } from './presentation/store/slices/todoSlice';

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const lastUpdated = useAppSelector(selectLastUpdated);
  const error = useAppSelector(selectError);

  // 初回読み込みとポーリング（5秒ごと）
  useEffect(() => {
    dispatch(fetchTodos());
    const intervalId = setInterval(() => {
      dispatch(fetchTodos());
    }, 5000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Storage Event（複数タブ同期）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'todo-app-data' || e.key === null) {
        dispatch(fetchTodos());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return (
    <div>
      <h1>Todo アプリケーション</h1>
      {lastUpdated && <p>最終更新: {lastUpdated.toLocaleTimeString()}</p>}
      {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
      {loading ? <p>読み込み中...</p> : <TodoList />}
    </div>
  );
}
```

**変更点**:
- ❌ `useState`, `useCallback`を削除
- ✅ `useAppDispatch`, `useAppSelector`を使用
- ✅ `dispatch(fetchTodos())`でThunkを呼び出し
- ✅ エラー表示を追加

---

### TodoList.tsx

```typescript
import { useAppSelector } from '../store/hooks';
import { selectTodos } from '../store/slices/todoSlice';

export function TodoList() {
  const todos = useAppSelector(selectTodos);

  if (todos.length === 0) {
    return <p>Todoがありません</p>;
  }

  return (
    <div>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

**変更点**:
- ❌ Props `todos`, `onUpdate`を削除
- ✅ `useAppSelector(selectTodos)`で直接Storeから取得

---

### TodoItem.tsx

```typescript
import { useAppDispatch } from '../store/hooks';
import { updateTodoStatus, updateTodoAssignee } from '../store/slices/todoSlice';

export function TodoItem({ todo }: TodoItemProps) {
  const dispatch = useAppDispatch();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TodoStatus;
    await dispatch(updateTodoStatus({ todoId: todo.id, newStatus }));
  };

  const handleAssigneeChange = async (newAssignee: Assignee | null) => {
    await dispatch(updateTodoAssignee({ todoId: todo.id, newAssignee }));
  };

  // ... render
}
```

**変更点**:
- ❌ Props `onUpdate`を削除
- ❌ UseCaseの直接呼び出しを削除
- ✅ `dispatch(updateTodoStatus())`でThunkを呼び出し
- ✅ 更新後に自動的にstateが更新される（onUpdate不要）

---

## データフロー（Redux版）

### Todo取得フロー

```
User → App.tsx
       ↓
  dispatch(fetchTodos())
       ↓
  Redux Thunk
       ↓
  GetTodosUseCase.execute()
       ↓
  LocalStorageTodoRepository.findAll()
       ↓
  LocalStorage.getItem()
       ↓
  新しいTodo[]を返す
       ↓
  Redux State更新（todos）
       ↓
  TodoList自動再レンダリング（useAppSelector）
       ↓
  UI更新
```

### Todo更新フロー

```
User → TodoItem（selectを変更）
       ↓
  handleStatusChange()
       ↓
  dispatch(updateTodoStatus({ todoId, newStatus }))
       ↓
  Redux Thunk
       ↓
  UpdateTodoStatusUseCase.execute()
       ↓
  LocalStorageTodoRepository.update()
       ↓
  LocalStorage.setItem()
       ↓
  GetTodosUseCase.execute()（最新データ取得）
       ↓
  Redux State更新（todos）
       ↓
  全コンポーネント自動再レンダリング
       ↓
  UI更新
```

---

## Reduxのメリット

### 以前の実装（useState）

```typescript
// App.tsx
const [todos, setTodos] = useState<Todo[]>([]);

const fetchTodos = useCallback(async () => {
  const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
  const fetchedTodos = await getTodosUseCase.execute();
  setTodos([...fetchedTodos]);
}, []);

// TodoList.tsx
<TodoList todos={todos} onUpdate={fetchTodos} />

// TodoItem.tsx
const handleStatusChange = async () => {
  await updateStatusUseCase.execute(todoId, newStatus);
  onUpdate();  // 親に通知してfetchTodosを呼び出す
};
```

**課題**:
- Props Drilling（todosとonUpdateを子に渡す）
- コールバック地獄（onUpdate → fetchTodos）
- 状態の分散（todos, loading, lastUpdatedがそれぞれuseState）

### Redux実装

```typescript
// App.tsx
dispatch(fetchTodos());

// TodoList.tsx
const todos = useAppSelector(selectTodos);  // Propsなし

// TodoItem.tsx
const dispatch = useAppDispatch();
dispatch(updateTodoStatus({ todoId, newStatus }));  // onUpdateなし
```

**改善点**:
✅ **Props削減**: todos, onUpdateが不要
✅ **グローバル状態**: どのコンポーネントからでもアクセス可能
✅ **自動更新**: dispatch後に自動的に全コンポーネント更新
✅ **型安全**: TypeScript完全対応
✅ **DevTools**: Redux DevToolsでデバッグ容易
✅ **テスト容易**: Reducer, Thunk, Selectorを個別にテスト可能

---

## Redux DevTools

### インストール

ブラウザ拡張機能をインストール:
- [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

### 使用方法

1. DevToolsを開く（F12）
2. "Redux"タブを選択
3. アクションの履歴を確認
4. State差分を確認
5. Time Travel Debugging（過去の状態に戻る）

### 表示される情報

```
Action: todo/fetchTodos/pending
State:
  todo:
    todos: []
    loading: true
    lastUpdated: null
    error: null

Action: todo/fetchTodos/fulfilled
Payload: [Todo, Todo, Todo, Todo]
State:
  todo:
    todos: [Todo, Todo, Todo, Todo]
    loading: false
    lastUpdated: 2025-11-03T20:39:53.123Z
    error: null

Action: todo/updateTodoStatus/fulfilled
Payload: [Todo, Todo, Todo, Todo]
State:
  todo:
    todos: [Todo(updated), Todo, Todo, Todo]
    lastUpdated: 2025-11-03T20:40:10.456Z
```

---

## パフォーマンス最適化

### 現在の実装

Redux Toolkitはデフォルトで以下の最適化を提供：
- **Immer**: イミュータブルな更新を自動化
- **Memoization**: Selectorの結果をキャッシュ
- **Shallow Equality**: useAppSelectorは浅い比較で再レンダリングを判断

### 将来の最適化

#### 1. Reselect（Memoized Selectors）

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectCompletedTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter(todo => todo.status === 'completed')
);

export const selectInProgressTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter(todo => todo.status === 'in_progress')
);
```

#### 2. React.memo

```typescript
export const TodoItem = React.memo(({ todo }: TodoItemProps) => {
  // ...
});
```

#### 3. Slice分割

```typescript
// store.ts
export const store = configureStore({
  reducer: {
    todo: todoReducer,
    user: userReducer,       // 将来追加
    settings: settingsReducer, // 将来追加
  },
});
```

---

## テスト戦略

### Reducer テスト

```typescript
import todoReducer, { fetchTodos } from './todoSlice';

describe('todoSlice', () => {
  it('should handle fetchTodos.fulfilled', () => {
    const initialState = { todos: [], loading: true, lastUpdated: null, error: null };
    const action = { type: fetchTodos.fulfilled.type, payload: [mockTodo1, mockTodo2] };
    const state = todoReducer(initialState, action);

    expect(state.todos).toHaveLength(2);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });
});
```

### Thunk テスト

```typescript
import { fetchTodos } from './todoSlice';
import { container } from '../../../application/di/container';

jest.mock('../../../application/di/container');

describe('fetchTodos thunk', () => {
  it('should fetch todos from repository', async () => {
    const mockRepository = {
      findAll: jest.fn().mockResolvedValue([mockTodo1, mockTodo2]),
    };
    container.getTodoRepository.mockReturnValue(mockRepository);

    const dispatch = jest.fn();
    const thunk = fetchTodos();
    await thunk(dispatch, jest.fn(), undefined);

    expect(mockRepository.findAll).toHaveBeenCalled();
  });
});
```

### Component テスト

```typescript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TodoList } from './TodoList';

describe('TodoList', () => {
  it('should display todos from Redux store', () => {
    const store = configureStore({
      reducer: { todo: todoReducer },
      preloadedState: {
        todo: {
          todos: [mockTodo1, mockTodo2],
          loading: false,
          lastUpdated: new Date(),
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <TodoList />
      </Provider>
    );

    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });
});
```

---

## トラブルシューティング

### 1. non-serializable value 警告

**症状**: コンソールに警告が表示される

**原因**: Todoクラスインスタンスがstateに含まれている

**解決**: `store.ts`で`serializableCheck`を設定済み

### 2. 型エラー

**症状**: `useSelector`や`useDispatch`で型エラー

**解決**: `useAppSelector`, `useAppDispatch`を使用

### 3. 状態が更新されない

**症状**: dispatchしても画面が更新されない

**原因**:
- Reducerでstateを直接変更している（Immerを使用すること）
- useAppSelectorの引数が間違っている

**解決**:
```typescript
// ❌ 直接変更
state.todos.push(newTodo);

// ✅ Immerを使用（Redux Toolkit推奨）
state.todos.push(newTodo);  // 実はこれでOK（Immer内部で動作）

// または
return { ...state, todos: [...state.todos, newTodo] };
```

---

## まとめ

### Redux統合で得られたもの

✅ **グローバル状態管理**: すべてのコンポーネントから状態にアクセス
✅ **Props削減**: todosやonUpdateコールバックが不要
✅ **型安全**: TypeScript完全対応
✅ **デバッグ容易**: Redux DevToolsで状態遷移を追跡
✅ **テスト容易**: Reducer, Thunk, Selectorを個別にテスト
✅ **保守性向上**: 状態ロジックが一箇所に集約

### アーキテクチャの維持

❌ **変更なし**:
- Domain層（Entity, Value Object, Repository Interface）
- Application層（Use Cases, DI Container）
- Infrastructure層（LocalStorageTodoRepository）

✅ **変更あり**:
- Presentation層のみRedux統合

### DDDとReduxの共存

Reduxを導入しても、DDDの原則は維持：
- **エンティティ**: Todoクラスをそのまま使用
- **Use Case**: Thunkから呼び出し
- **リポジトリ**: DIコンテナ経由で取得
- **依存性逆転**: Application層はPresentation層に依存しない

---

最終更新: 2025-11-03

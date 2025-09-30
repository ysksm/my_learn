# 初回表示と操作が混在するコンポーネントの推奨実装パターン

## 前提シナリオ

ユーザー管理画面を想定：
- **初回表示**: ユーザー一覧を取得して表示
- **作成操作**: 新規ユーザーを作成
- **更新操作**: ユーザー情報を編集
- **削除操作**: ユーザーを削除
- **検索操作**: ユーザーを検索（デバウンス付き）

## アンチパターン: すべてuseAsyncStateで管理

```typescript
// ❌ 悪い例 - すべての操作をuseAsyncStateで管理しようとする
export const UserManagement: React.FC = () => {
  const getUsersUseCase = container.getUsersUseCase();
  const createUserUseCase = container.createUserUseCase();
  const updateUserUseCase = container.updateUserUseCase();
  const deleteUserUseCase = container.deleteUserUseCase();

  // 初回表示
  const { data: users, loading, error, refetch } = useAsyncState(
    (signal) => getUsersUseCase.execute(signal),
    []
  );

  // ❌ 問題1: 依存配列が変わるたびに意図せず実行される
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const { data: createdUser, loading: createLoading } = useAsyncState(
    (signal) => createUserUseCase.execute(newUser.name, newUser.email, signal),
    [newUser] // ❌ newUserが変わるたびに実行される
  );

  // ❌ 問題2: 削除対象IDが変わるたびに実行される
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { loading: deleteLoading } = useAsyncState(
    (signal) => deleteId ? deleteUserUseCase.execute(deleteId, signal) : Promise.resolve(),
    [deleteId] // ❌ deleteIdが変わるたびに実行される
  );

  // ❌ 問題3: Loading状態の管理が複雑
  const isLoading = loading || createLoading || deleteLoading;

  return (
    // JSX
  );
};
```

**問題点**:
1. 意図しないタイミングで非同期処理が実行される
2. Loading状態とError状態の管理が複雑化
3. ユーザーアクション（ボタンクリック）と処理実行のタイミングが合わない
4. コードの予測可能性が低い

## 推奨パターン: 混在型アプローチ

### パターンA: useAsyncState + 手動実装（基本形）

```typescript
// ✅ 推奨 - 初回表示はuseAsyncState、操作は手動実装
export const UserManagement: React.FC = () => {
  const getUsersUseCase = container.getUsersUseCase();
  const createUserUseCase = container.createUserUseCase();
  const updateUserUseCase = container.updateUserUseCase();
  const deleteUserUseCase = container.deleteUserUseCase();

  // ==========================================
  // 初回表示: useAsyncStateで自動実行
  // ==========================================
  const {
    data: users,
    loading: fetchLoading,
    error: fetchError,
    refetch
  } = useAsyncState(
    (signal) => getUsersUseCase.execute(signal),
    []
  );

  // ==========================================
  // 作成操作: 手動実装
  // ==========================================
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<RepositoryError | null>(null);

  const handleCreateUser = async (name: string, email: string) => {
    setCreateLoading(true);
    setCreateError(null);

    const result = await createUserUseCase.execute(name, email);

    setCreateLoading(false);

    if (result.isError()) {
      setCreateError(result.getError());
      return false;
    }

    // 成功したら一覧を再取得
    refetch();
    return true;
  };

  // ==========================================
  // 更新操作: 手動実装
  // ==========================================
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<RepositoryError | null>(null);

  const handleUpdateUser = async (id: number, name: string, email: string) => {
    setUpdateLoading(true);
    setUpdateError(null);

    const result = await updateUserUseCase.execute(id, name, email);

    setUpdateLoading(false);

    if (result.isError()) {
      setUpdateError(result.getError());
      return false;
    }

    refetch();
    return true;
  };

  // ==========================================
  // 削除操作: 手動実装
  // ==========================================
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<RepositoryError | null>(null);

  const handleDeleteUser = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;

    setDeleteLoading(true);
    setDeleteError(null);

    const result = await deleteUserUseCase.execute(id);

    setDeleteLoading(false);

    if (result.isError()) {
      setDeleteError(result.getError());
      return false;
    }

    refetch();
    return true;
  };

  // ==========================================
  // UI
  // ==========================================
  if (fetchLoading) return <div>Loading...</div>;
  if (fetchError) return <div>Error: {fetchError.message}</div>;

  return (
    <div>
      <h1>User Management</h1>

      {/* 作成フォーム */}
      <UserCreateForm
        onSubmit={handleCreateUser}
        loading={createLoading}
        error={createError}
      />

      {/* ユーザー一覧 */}
      <UserList
        users={users || []}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        updateLoading={updateLoading}
        deleteLoading={deleteLoading}
        updateError={updateError}
        deleteError={deleteError}
      />
    </div>
  );
};
```

### パターンAの評価

#### メリット ✅

1. **意図が明確**
   - 初回表示は自動実行
   - 操作はユーザーアクションで実行
   - コードの予測可能性が高い

2. **Loading状態が分離**
   - 各操作のLoading状態を独立管理
   - UI側で「どの操作が進行中か」を表示可能

3. **エラーハンドリングが明確**
   - 各操作のエラーを個別に扱える
   - エラー表示の粒度を細かくできる

#### デメリット ❌

1. **ボイラープレートが多い**
   - Loading/Error状態の定義が繰り返される
   - 各操作ごとにほぼ同じパターンのコード

2. **コンポーネントが肥大化**
   - 操作が増えるとコンポーネントが長くなる

## パターンB: カスタムフックで操作を抽象化（推奨）

### カスタムフック: useAsyncOperation

```typescript
// hooks/useAsyncOperation.ts
import { useState, useCallback } from 'react';
import { Result } from '../domain/common/Result';
import { RepositoryError } from '../domain/repositories/IUserRepository';

interface AsyncOperationState {
  loading: boolean;
  error: RepositoryError | null;
}

export function useAsyncOperation<TArgs extends any[], TResult>(
  operation: (...args: [...TArgs, AbortSignal?]) => Promise<Result<TResult, RepositoryError>>,
  onSuccess?: (result: TResult) => void
) {
  const [state, setState] = useState<AsyncOperationState>({
    loading: false,
    error: null
  });

  const execute = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setState({ loading: true, error: null });

    const result = await operation(...args);

    if (result.isError()) {
      setState({ loading: false, error: result.getError() });
      return null;
    }

    const value = result.getValue();
    setState({ loading: false, error: null });
    onSuccess?.(value);
    return value;
  }, [operation, onSuccess]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    clearError
  };
}
```

### カスタムフックを使った実装

```typescript
// ✅ 推奨 - カスタムフックで操作を抽象化
export const UserManagement: React.FC = () => {
  const getUsersUseCase = container.getUsersUseCase();
  const createUserUseCase = container.createUserUseCase();
  const updateUserUseCase = container.updateUserUseCase();
  const deleteUserUseCase = container.deleteUserUseCase();

  // ==========================================
  // 初回表示: useAsyncState
  // ==========================================
  const {
    data: users,
    loading: fetchLoading,
    error: fetchError,
    refetch
  } = useAsyncState(
    (signal) => getUsersUseCase.execute(signal),
    []
  );

  // ==========================================
  // 作成操作: useAsyncOperation
  // ==========================================
  const createOperation = useAsyncOperation(
    (name: string, email: string, signal?: AbortSignal) =>
      createUserUseCase.execute(name, email, signal),
    () => refetch() // 成功時に一覧を再取得
  );

  // ==========================================
  // 更新操作: useAsyncOperation
  // ==========================================
  const updateOperation = useAsyncOperation(
    (id: number, name: string, email: string, signal?: AbortSignal) =>
      updateUserUseCase.execute(id, name, email, signal),
    () => refetch()
  );

  // ==========================================
  // 削除操作: useAsyncOperation
  // ==========================================
  const deleteOperation = useAsyncOperation(
    (id: number, signal?: AbortSignal) =>
      deleteUserUseCase.execute(id, signal),
    () => refetch()
  );

  // ==========================================
  // ハンドラー関数（簡潔になる）
  // ==========================================
  const handleCreateUser = async (name: string, email: string) => {
    const result = await createOperation.execute(name, email);
    return result !== null;
  };

  const handleUpdateUser = async (id: number, name: string, email: string) => {
    const result = await updateOperation.execute(id, name, email);
    return result !== null;
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return false;
    const result = await deleteOperation.execute(id);
    return result !== null;
  };

  // ==========================================
  // UI
  // ==========================================
  if (fetchLoading) return <div>Loading...</div>;
  if (fetchError) return <div>Error: {fetchError.message}</div>;

  return (
    <div>
      <h1>User Management</h1>

      <UserCreateForm
        onSubmit={handleCreateUser}
        loading={createOperation.loading}
        error={createOperation.error}
      />

      <UserList
        users={users || []}
        onUpdate={handleUpdateUser}
        onDelete={handleDeleteUser}
        updateLoading={updateOperation.loading}
        deleteLoading={deleteOperation.loading}
        updateError={updateOperation.error}
        deleteError={deleteOperation.error}
      />
    </div>
  );
};
```

### パターンBの評価

#### メリット ✅

1. **ボイラープレート削減**
   - Loading/Error状態の管理をフックに委譲
   - コンポーネントがスッキリ

2. **再利用性**
   - `useAsyncOperation`を他のコンポーネントでも使える
   - 操作の共通パターンを一箇所で管理

3. **拡張性**
   - 成功時のコールバック（`onSuccess`）で一覧再取得
   - リトライ機能やキャンセル機能を追加しやすい

4. **コードの一貫性**
   - すべての操作が同じパターンで実装される

#### デメリット ❌

1. **抽象化レイヤーの追加**
   - カスタムフックの理解が必要
   - デバッグ時のスタックが深くなる

2. **型安全性の確保が難しい**
   - 可変長引数の型推論が複雑

## パターンC: 複合カスタムフックで完全カプセル化（高度）

```typescript
// hooks/useUserManagement.ts
export function useUserManagement() {
  const getUsersUseCase = container.getUsersUseCase();
  const createUserUseCase = container.createUserUseCase();
  const updateUserUseCase = container.updateUserUseCase();
  const deleteUserUseCase = container.deleteUserUseCase();

  // 一覧取得
  const { data: users, loading: fetchLoading, error: fetchError, refetch } = useAsyncState(
    (signal) => getUsersUseCase.execute(signal),
    []
  );

  // 各操作
  const createOperation = useAsyncOperation(
    (name: string, email: string, signal?: AbortSignal) =>
      createUserUseCase.execute(name, email, signal),
    () => refetch()
  );

  const updateOperation = useAsyncOperation(
    (id: number, name: string, email: string, signal?: AbortSignal) =>
      updateUserUseCase.execute(id, name, email, signal),
    () => refetch()
  );

  const deleteOperation = useAsyncOperation(
    (id: number, signal?: AbortSignal) =>
      deleteUserUseCase.execute(id, signal),
    () => refetch()
  );

  // ハンドラー関数
  const createUser = async (name: string, email: string) => {
    return await createOperation.execute(name, email);
  };

  const updateUser = async (id: number, name: string, email: string) => {
    return await updateOperation.execute(id, name, email);
  };

  const deleteUser = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return null;
    return await deleteOperation.execute(id);
  };

  return {
    // データ
    users,

    // Loading状態
    fetchLoading,
    createLoading: createOperation.loading,
    updateLoading: updateOperation.loading,
    deleteLoading: deleteOperation.loading,

    // Error状態
    fetchError,
    createError: createOperation.error,
    updateError: updateOperation.error,
    deleteError: deleteOperation.error,

    // 操作
    createUser,
    updateUser,
    deleteUser,
    refetch
  };
}
```

```typescript
// Component: 非常にシンプルになる
export const UserManagement: React.FC = () => {
  const {
    users,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchError,
    createError,
    updateError,
    deleteError,
    createUser,
    updateUser,
    deleteUser
  } = useUserManagement();

  if (fetchLoading) return <div>Loading...</div>;
  if (fetchError) return <div>Error: {fetchError.message}</div>;

  return (
    <div>
      <h1>User Management</h1>

      <UserCreateForm
        onSubmit={createUser}
        loading={createLoading}
        error={createError}
      />

      <UserList
        users={users || []}
        onUpdate={updateUser}
        onDelete={deleteUser}
        updateLoading={updateLoading}
        deleteLoading={deleteLoading}
        updateError={updateError}
        deleteError={deleteError}
      />
    </div>
  );
};
```

### パターンCの評価

#### メリット ✅

1. **コンポーネントが最もシンプル**
   - ビジネスロジックが完全に分離
   - UIとロジックの完全な分離

2. **テスタビリティ最高**
   - `useUserManagement`フックを独立してテスト可能
   - コンポーネントのテストはUIロジックのみ

3. **再利用性**
   - 同じユーザー管理ロジックを複数のコンポーネントで使える

#### デメリット ❌

1. **過剰な抽象化のリスク**
   - 小規模なコンポーネントでは過剰
   - カスタムフックの複雑度が増す

2. **フックの責務が大きくなる**
   - 1つのフックに複数の責務が集中

## 検索機能が追加される場合

```typescript
// hooks/useDebouncedAsyncState.ts
import { useState, useEffect, useRef } from 'react';
import { useAsyncState } from './useAsyncState';

export function useDebouncedAsyncState<T>(
  asyncFunction: (query: string, signal: AbortSignal) => Promise<Result<T, RepositoryError>>,
  query: string,
  delay: number = 500
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  // デバウンスされたクエリでuseAsyncStateを使用
  const result = useAsyncState(
    (signal) => asyncFunction(debouncedQuery, signal),
    [debouncedQuery]
  );

  return {
    ...result,
    isDebouncing: query !== debouncedQuery
  };
}
```

```typescript
// Component with search
export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索クエリが空の場合は全件取得、それ以外は検索
  const shouldSearch = searchQuery.trim().length > 0;

  const { data: users, loading, error } = useDebouncedAsyncState(
    (query, signal) =>
      shouldSearch
        ? searchUsersUseCase.execute(query, signal)
        : getUsersUseCase.execute(signal),
    searchQuery
  );

  // ... その他の操作
};
```

## 推奨の選択基準

| コンポーネントの複雑度 | 推奨パターン | 理由 |
|-------------------|------------|------|
| 小規模（1-2操作） | パターンA | シンプルで直感的 |
| 中規模（3-5操作） | パターンB | ボイラープレート削減とバランス |
| 大規模（6操作以上） | パターンC | 完全なカプセル化で保守性向上 |
| 複数箇所で同じロジック | パターンC | 再利用性が最も高い |

## まとめ

### 基本原則

1. **初回表示時のデータ取得**: `useAsyncState` を使用
2. **ユーザー操作（作成・更新・削除）**: 手動実装または `useAsyncOperation`
3. **検索（デバウンス）**: `useDebouncedAsyncState`
4. **複雑なロジック**: カスタムフックで抽象化

### コード構成

```
Component
├── useAsyncState (初回表示)
├── useAsyncOperation (作成操作)
├── useAsyncOperation (更新操作)
├── useAsyncOperation (削除操作)
└── useDebouncedAsyncState (検索操作) ※オプション
```

### ファイル構成

```
src/
├── components/
│   └── UserManagement.tsx (UIロジックのみ)
├── hooks/
│   ├── useAsyncState.ts (初回表示用)
│   ├── useAsyncOperation.ts (操作用)
│   ├── useDebouncedAsyncState.ts (検索用)
│   └── useUserManagement.ts (複合フック、オプション)
└── application/usecases/
    ├── GetUsersUseCase.ts
    ├── CreateUserUseCase.ts
    ├── UpdateUserUseCase.ts
    └── DeleteUserUseCase.ts
```

この構成により、初回表示と操作が混在する実際のコンポーネントを、保守性と可読性を保ちながら実装できます。
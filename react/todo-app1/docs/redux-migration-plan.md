# Redux Toolkit移行計画

## 移行ステータス

✅ **移行完了** (2025-11-03)

すべてのフェーズが正常に完了し、Redux Toolkitへの移行が成功しました。

## 概要

現在のシンプルなReact状態管理（useState）から、Redux ToolkitとReduxを使ったグローバル状態管理に移行します。

## 移行の方針

### 変更する層
- ✅ **Presentation層**: React状態管理からReduxへ移行

### 変更しない層
- ❌ **Domain層**: そのまま維持
- ❌ **Application層**: そのまま維持（UseCaseは継続使用）
- ❌ **Infrastructure層**: そのまま維持

### アーキテクチャの位置づけ

```
┌─────────────────────────────────┐
│   Presentation Layer            │
│   - Redux Store (新規)          │
│   - Slices (新規)               │
│   - Thunks (新規)               │  ← ここだけ変更
│   - React Components (更新)     │
└────────────┬────────────────────┘
             │ Thunkから呼び出す
             ↓
┌─────────────────────────────────┐
│   Application Layer             │  ← 変更なし
│   - Use Cases                   │
└─────────────────────────────────┘
```

---

## 移行ステップ

### Phase 1: セットアップ（パッケージインストール）

- [ ] Redux Toolkitとreact-reduxをインストール
- [ ] TypeScript型定義を確認

**コマンド**:
```bash
npm install @reduxjs/toolkit react-redux
```

---

### Phase 2: Redux Storeの設定

- [ ] `src/presentation/store/store.ts`を作成
- [ ] RootStateとAppDispatch型を定義
- [ ] Storeを設定

**成果物**:
- `src/presentation/store/store.ts`

---

### Phase 3: Todo Sliceの作成

- [ ] `src/presentation/store/slices/todoSlice.ts`を作成
- [ ] State定義（todos, loading, lastUpdated, error）
- [ ] Reducersの定義（同期的な状態更新）
- [ ] Selectorsの定義（状態の取得）

**成果物**:
- `src/presentation/store/slices/todoSlice.ts`

---

### Phase 4: Thunksの作成（非同期処理）

- [ ] `fetchTodos` thunkを作成（GetTodosUseCase呼び出し）
- [ ] `updateTodoStatus` thunkを作成（UpdateTodoStatusUseCase呼び出し）
- [ ] `updateTodoAssignee` thunkを作成（UpdateTodoAssigneeUseCase呼び出し）

**成果物**:
- `src/presentation/store/slices/todoSlice.ts`（thunks追加）

---

### Phase 5: App.tsxへのProvider統合

- [ ] `main.tsx`にRedux Providerを追加
- [ ] App.tsxから状態管理ロジックを削除（一時的にコメントアウト）
- [ ] Redux Storeが正しく接続されているか確認

**成果物**:
- `src/main.tsx`（Provider追加）

---

### Phase 6: App.tsxのリファクタリング

- [ ] useStateを削除
- [ ] useSelectorでRedux状態を取得
- [ ] useDispatchでアクションをディスパッチ
- [ ] useEffectでポーリングを設定（dispatch(fetchTodos())を呼び出し）
- [ ] Storage Eventハンドラを更新

**成果物**:
- `src/App.tsx`（Redux接続）

---

### Phase 7: TodoItemのリファクタリング

- [ ] useDispatchを使用
- [ ] handleStatusChangeで`updateTodoStatus` thunkをディスパッチ
- [ ] handleAssigneeChangeで`updateTodoAssignee` thunkをディスパッチ
- [ ] onUpdateコールバックを削除（Reduxが自動的に状態更新）

**成果物**:
- `src/presentation/components/TodoItem.tsx`（Redux接続）

---

### Phase 8: TodoListの更新

- [ ] Propsからtodosを削除（useSelectorで取得）
- [ ] onUpdateコールバックを削除

**成果物**:
- `src/presentation/components/TodoList.tsx`（Redux接続）

---

### Phase 9: 動作確認

- [ ] 初回読み込みが正常に動作
- [ ] ポーリング（5秒ごと）が動作
- [ ] Todo状態変更が動作
- [ ] Todo担当者変更が動作
- [ ] 複数タブ同期が動作
- [ ] ローディング状態が表示される
- [ ] エラーハンドリングが動作

---

### Phase 10: ドキュメント更新

- [ ] `docs/architecture/presentation-layer.md`を更新（Redux追加）
- [ ] `CLAUDE.md`を更新
- [ ] シーケンス図を更新（Redux経由のフロー）

---

## 新しいファイル構成

```
src/
├── presentation/
│   ├── store/                          # 新規ディレクトリ
│   │   ├── store.ts                   # Redux Store設定
│   │   ├── hooks.ts                   # Typed hooks (useAppDispatch, useAppSelector)
│   │   └── slices/
│   │       └── todoSlice.ts           # Todo Slice + Thunks
│   ├── components/
│   │   ├── TodoList.tsx               # 更新（Redux接続）
│   │   ├── TodoItem.tsx               # 更新（Redux接続）
│   │   └── AssigneeSelector.tsx       # 変更なし
│   └── hooks/                          # 将来的に追加
│
├── App.tsx                             # 更新（Redux接続）
├── main.tsx                            # 更新（Provider追加）
└── （他の層は変更なし）
```

---

## Redux Toolkitのメリット

### 現在の実装の課題

1. **状態の分散**: useState で複数の状態を管理
2. **Props Drilling**: onUpdate コールバックを子に渡す必要
3. **非同期ロジックの分散**: fetchTodos が App.tsx に存在

### Redux Toolkit導入後の改善

1. **グローバル状態**: すべてのコンポーネントから状態にアクセス可能
2. **Props削減**: onUpdate 不要、useDispatch で直接アクション実行
3. **非同期ロジックの集約**: Thunks で UseCase 呼び出しを集約
4. **TypeScript統合**: 型安全な状態管理
5. **DevTools**: Redux DevToolsでデバッグが容易
6. **テスト容易性**: Reducerは純粋関数でテストしやすい

---

## Reduxの状態構造

```typescript
{
  todo: {
    todos: Todo[],           // Todo一覧
    loading: boolean,        // ローディング状態
    lastUpdated: Date | null, // 最終更新時刻
    error: string | null     // エラーメッセージ
  }
}
```

---

## Thunks設計

### fetchTodos

```typescript
export const fetchTodos = createAsyncThunk(
  'todo/fetchTodos',
  async () => {
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    return await getTodosUseCase.execute();
  }
);
```

### updateTodoStatus

```typescript
export const updateTodoStatus = createAsyncThunk(
  'todo/updateTodoStatus',
  async ({ todoId, newStatus }: { todoId: string; newStatus: TodoStatus }) => {
    const useCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
    await useCase.execute(todoId, newStatus);
    // 更新後に再取得
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    return await getTodosUseCase.execute();
  }
);
```

---

## 既存コードとの互換性

### Domain層・Application層・Infrastructure層

- **変更なし**: すべてのUseCaseはそのまま使用
- **DIコンテナ**: 引き続き使用
- **LocalStorageRepository**: そのまま使用
- **ポーリング**: Presentation層で実装（setInterval + dispatch）
- **Storage Event**: Presentation層で実装（addEventListener + dispatch）

---

## 移行中の注意点

1. **段階的な移行**: 一度にすべてを変更せず、フェーズごとに確認
2. **既存機能の維持**: ポーリングとStorage Eventは引き続き動作
3. **UseCase継続使用**: Redux ThunkからUseCaseを呼び出す
4. **型安全性**: TypeScriptの型定義を正しく設定

---

## 移行後のデータフロー

### Todo取得フロー

```
User → Component → dispatch(fetchTodos())
                        ↓
                   Redux Thunk
                        ↓
                GetTodosUseCase
                        ↓
                TodoRepository
                        ↓
                LocalStorage
                        ↓
                Redux State更新
                        ↓
                Component再レンダリング
```

### Todo更新フロー

```
User → TodoItem → dispatch(updateTodoStatus())
                        ↓
                   Redux Thunk
                        ↓
            UpdateTodoStatusUseCase
                        ↓
                TodoRepository
                        ↓
                LocalStorage
                        ↓
            dispatch(fetchTodos()) // 再取得
                        ↓
                Redux State更新
```

---

## テスト戦略

### Redux Sliceのテスト

- Reducersの単体テスト（純粋関数）
- Thunksのテスト（UseCase呼び出しをモック）

### Componentsのテスト

- Redux Storeをモック
- useSelector, useDispatchをモック

---

## 移行完了後の検証項目

- [ ] ビルドエラーなし
- [ ] TypeScriptエラーなし
- [ ] 初回読み込み動作
- [ ] ポーリング動作
- [ ] 状態変更動作
- [ ] 担当者変更動作
- [ ] 複数タブ同期動作
- [ ] エラーハンドリング
- [ ] Redux DevToolsで状態確認可能

---

## 推定作業時間

| フェーズ | 所要時間 |
|---------|---------|
| Phase 1: セットアップ | 5分 |
| Phase 2: Store設定 | 10分 |
| Phase 3: Slice作成 | 20分 |
| Phase 4: Thunks作成 | 30分 |
| Phase 5: Provider統合 | 10分 |
| Phase 6: App.tsx更新 | 20分 |
| Phase 7: TodoItem更新 | 15分 |
| Phase 8: TodoList更新 | 10分 |
| Phase 9: 動作確認 | 30分 |
| Phase 10: ドキュメント | 20分 |
| **合計** | **約2.5〜3時間** |

---

## 参考資料

- [Redux Toolkit公式ドキュメント](https://redux-toolkit.js.org/)
- [React Redux公式ドキュメント](https://react-redux.js.org/)
- [TypeScriptとRedux Toolkit](https://redux-toolkit.js.org/usage/usage-with-typescript)

---

最終更新: 2025-11-03

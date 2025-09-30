# UseCaseと複数Repository、useAsyncの呼び出し回数の検討

## 検討課題

1. **複数のRepositoryを使う場合、UseCaseでどう扱うべきか？**
2. **1つのコンポーネントに複数の操作がある場合、useAsyncは何回呼び出すべきか？**

## 現状の実装分析

### 現在のMultipleApiTestの実装

```typescript
// MultipleApiTest.tsx
const userRepository = container.getUserRepository();
const postRepository = container.getPostRepository();

const { data, loading, error, executeParallel, executeSequential } = useMultipleAsync(
  [
    (signal) => userRepository.getAllUsers(signal),
    (signal) => postRepository.getAllPosts(signal)
  ],
  (results) => ({
    users: results[0],
    posts: results[1],
    summary: `Found ${results[0].length} users and ${results[1].length} posts`
  })
);
```

**問題点**:
- Component内で複数のRepositoryを直接扱っている
- データの結合ロジック（combiner関数）がUI層に存在
- ビジネスロジック（データ結合）がプレゼンテーション層に漏れている

## パターン1: UseCaseで複数Repositoryをラップ

### 設計案

```typescript
// application/usecases/GetUserPostsSummaryUseCase.ts
export class GetUserPostsSummaryUseCase {
  constructor(
    private userRepository: IUserRepository,
    private postRepository: IPostRepository
  ) {}

  async execute(signal?: AbortSignal): Promise<Result<UserPostsSummaryDto, RepositoryError>> {
    // パターンA: 並列実行
    const [usersResult, postsResult] = await Promise.all([
      this.userRepository.getAllUsers(signal),
      this.postRepository.getAllPosts(signal)
    ]);

    if (usersResult.isError()) return Result.error(usersResult.getError());
    if (postsResult.isError()) return Result.error(postsResult.getError());

    const users = usersResult.getValue();
    const posts = postsResult.getValue();

    // ビジネスロジック: データの結合と集計
    const summary: UserPostsSummaryDto = {
      users: UserDto.fromEntities(users),
      posts: PostDto.fromEntities(posts),
      userCount: users.length,
      postCount: posts.length,
      summary: `Found ${users.length} users and ${posts.length} posts`,
      // ビジネスロジック例
      averagePostsPerUser: users.length > 0 ? posts.length / users.length : 0
    };

    return Result.success(summary);
  }

  // パターンB: 逐次実行が必要な場合
  async executeSequential(signal?: AbortSignal): Promise<Result<UserPostsSummaryDto, RepositoryError>> {
    // 1. ユーザーを取得
    const usersResult = await this.userRepository.getAllUsers(signal);
    if (usersResult.isError()) return Result.error(usersResult.getError());

    // 2. 取得したユーザー情報を使ってPostsを取得（依存関係がある場合）
    const postsResult = await this.postRepository.getAllPosts(signal);
    if (postsResult.isError()) return Result.error(postsResult.getError());

    // ... 同様の処理
  }
}
```

```typescript
// Component
const useCase = container.getUserPostsSummaryUseCase();

const { data, loading, error, refetch } = useAsyncState(
  (signal) => useCase.execute(signal),
  []
);
```

### 批判的評価

#### メリット ✅

1. **責務の分離**
   - ビジネスロジック（データ結合、集計）がApplication層に配置
   - Componentはプレゼンテーションのみに専念
   - テスタビリティが向上（UseCaseを独立してテスト可能）

2. **再利用性**
   - 同じデータ結合ロジックを複数のComponentで使える
   - RxJSとPure React両方で同じUseCaseを使える

3. **エラーハンドリングの一元化**
   - 複数Repositoryのエラーハンドリングをひとつのレイヤーで処理
   - リトライロジックなどをUseCaseに集約可能

4. **型安全性**
   - 結合後のデータ構造が明確（DTOで定義）
   - ComponentはDTOの型を信頼できる

#### デメリット ❌

1. **柔軟性の喪失**
   - 並列/逐次の実行方法をUseCaseが決定してしまう
   - UI側で実行方法を選択できない（現状のMultipleApiTestの機能が失われる）

2. **UseCase爆発の懸念**
   - データの組み合わせパターンごとにUseCaseが必要
   - 「UsersとPosts」「UsersとComments」「PostsとComments」→3つのUseCase
   - 実行パターン（並列/逐次）も考慮すると、さらに増える

3. **進行状況の可視化が困難**
   - 現状のuseMultipleAsyncは進行状況（progress）を提供
   - UseCaseでラップすると、進行状況の取得が難しくなる

4. **過度な抽象化**
   - 単純な「2つのAPIを呼んで結合する」だけなのに、クラスとファイルが増える
   - 学習コストと保守コストが増加

## パターン2: 個別UseCaseを複数回呼び出し

### 設計案A: 複数のuseAsyncStateを使う

```typescript
// Component
const getUsersUseCase = container.getUsersUseCase();
const getPostsUseCase = container.getPostsUseCase();

// ❌ アンチパターン: 複数のuseAsyncStateを独立して呼ぶ
const { data: users, loading: usersLoading } = useAsyncState(
  (signal) => getUsersUseCase.execute(signal),
  []
);

const { data: posts, loading: postsLoading } = useAsyncState(
  (signal) => getPostsUseCase.execute(signal),
  []
);

// Component内でデータを結合
const combinedData = useMemo(() => {
  if (!users || !posts) return null;
  return {
    users,
    posts,
    summary: `Found ${users.length} users and ${posts.length} posts`
  };
}, [users, posts]);

const loading = usersLoading || postsLoading;
```

### 批判的評価

#### メリット ✅

1. **シンプルさ**
   - 既存のUseCase（GetUsersUseCase、GetPostsUseCase）を再利用
   - 新しいUseCaseを作る必要がない

2. **独立性**
   - 各データ取得が独立しているため、片方が失敗しても片方は成功できる
   - エラーハンドリングを個別に行える

3. **柔軟性**
   - データの組み合わせをComponent側で自由に変更可能

#### デメリット ❌

1. **タイミング制御が困難**
   - 両方のuseAsyncStateが独立してマウント時に実行される
   - 「ボタンクリック時に両方同時実行」が実装できない
   - 逐次実行の制御が不可能

2. **Loading状態の管理が複雑**
   - `usersLoading || postsLoading`では「どちらが完了したか」が不明
   - 進行状況の可視化が不可能

3. **エラーハンドリングの複雑化**
   - 2つのエラー状態を管理する必要がある
   - どちらのエラーを優先して表示すべきか判断が必要

4. **レースコンディション**
   - 片方が先に完了したが、もう片方が失敗した場合の状態管理が複雑
   - データの一貫性が保証されない

5. **ビジネスロジックの漏出**
   - データ結合ロジック（combiner）がComponent内に存在
   - テストが困難

### 設計案B: useMultipleAsyncを使うが、UseCaseを渡す

```typescript
// Component
const getUsersUseCase = container.getUsersUseCase();
const getPostsUseCase = container.getPostsUseCase();

const { data, loading, error, executeParallel, executeSequential } = useMultipleAsync(
  [
    (signal) => getUsersUseCase.execute(signal),
    (signal) => getPostsUseCase.execute(signal)
  ],
  (results) => {
    // ❌ ビジネスロジックがComponent内に存在
    const [usersResult, postsResult] = results;
    return {
      users: usersResult,
      posts: postsResult,
      userCount: usersResult.length,
      postCount: postsResult.length,
      summary: `Found ${usersResult.length} users and ${postsResult.length} posts`
    };
  }
);
```

### 批判的評価

#### メリット ✅

1. **既存のUseCaseを再利用**
   - GetUsersUseCaseとGetPostsUseCaseを活用
   - 新しいUseCaseを作る必要がない

2. **実行制御の柔軟性**
   - 並列/逐次の選択をUI側で制御可能
   - 進行状況の可視化が可能

3. **タイミング制御**
   - ボタンクリック時に実行など、UIイベントとの連携が容易

#### デメリット ❌

1. **ビジネスロジックの漏出**（最大の問題）
   - データ結合ロジック（combiner関数）がComponent内に存在
   - `userCount`、`postCount`、`summary`の計算がUI層で行われている
   - テスタビリティが低い

2. **再利用性の欠如**
   - 同じデータ結合ロジックを別のComponentで使う場合、コピペが必要
   - DRY原則違反

3. **型安全性の低下**
   - combiner関数の戻り値の型が曖昧になりがち
   - DTOとして明確に定義されていない

## パターン3: ハイブリッドアプローチ（推奨）

### 設計案

```typescript
// application/usecases/GetUserPostsSummaryUseCase.ts
export class GetUserPostsSummaryUseCase {
  constructor(
    private getUsersUseCase: GetUsersUseCase,
    private getPostsUseCase: GetPostsUseCase
  ) {}

  // 方法1: 内部で並列実行を隠蔽
  async execute(signal?: AbortSignal): Promise<Result<UserPostsSummaryDto, RepositoryError>> {
    const [usersResult, postsResult] = await Promise.all([
      this.getUsersUseCase.execute(signal),
      this.getPostsUseCase.execute(signal)
    ]);

    if (usersResult.isError()) return Result.error(usersResult.getError());
    if (postsResult.isError()) return Result.error(postsResult.getError());

    const users = usersResult.getValue();
    const posts = postsResult.getValue();

    return Result.success(new UserPostsSummaryDto(users, posts));
  }

  // 方法2: 個別のUseCaseを公開して、呼び出し側で組み合わせ
  getUsersUseCase(): GetUsersUseCase {
    return this.getUsersUseCase;
  }

  getPostsUseCase(): GetPostsUseCase {
    return this.getPostsUseCase;
  }
}
```

```typescript
// hooks/useUserPostsSummary.ts
export function useUserPostsSummary() {
  const getUsersUseCase = container.getUsersUseCase();
  const getPostsUseCase = container.getPostsUseCase();

  // ビジネスロジック（データ結合）を含むcombinerを定義
  const combiner = useCallback((results: [UserDto[], PostDto[]]) => {
    const [users, posts] = results;
    return new UserPostsSummaryDto(users, posts);
  }, []);

  return useMultipleAsync(
    [
      (signal) => getUsersUseCase.execute(signal),
      (signal) => getPostsUseCase.execute(signal)
    ],
    combiner
  );
}
```

```typescript
// Component
const { data, loading, error, executeParallel, executeSequential } = useUserPostsSummary();
```

### 批判的評価

#### メリット ✅

1. **責務の分離**
   - ビジネスロジック（UserPostsSummaryDto）はApplication層
   - データ取得とUI制御の分離（カスタムフック）
   - Componentはプレゼンテーションのみ

2. **再利用性**
   - `useUserPostsSummary`を複数のComponentで使える
   - ビジネスロジックが一箇所に集約

3. **柔軟性**
   - 並列/逐次の実行方法を呼び出し側で選択可能
   - 進行状況の可視化も可能

4. **テスタビリティ**
   - UserPostsSummaryDtoのロジックを単体テスト可能
   - カスタムフックもテスト可能

#### デメリット ❌

1. **レイヤーの曖昧さ**
   - カスタムフックはどの層に属するのか？（Presentation層？Application層？）
   - UseCaseを使わずにカスタムフックで完結させる誘惑

2. **学習コスト**
   - DTOとカスタムフックの役割分担を理解する必要がある

3. **ファイル数の増加**
   - カスタムフック + DTO + 複数UseCase

## 1つのコンポーネントに複数操作がある場合

### シナリオ: ユーザー一覧画面

- ユーザー一覧の取得（初期表示）
- ユーザーの作成（ボタンクリック）
- ユーザーの削除（ボタンクリック）
- ユーザーの検索（入力フィールド）

### アンチパターン: 全操作に対してuseAsyncStateを使う

```typescript
// ❌ 悪い例
const { data: users, loading: listLoading } = useAsyncState(
  (signal) => getUsersUseCase.execute(signal),
  []
);

const { data: createdUser, loading: createLoading } = useAsyncState(
  (signal) => createUserUseCase.execute(name, email, signal),
  [name, email] // ❌ nameやemailが変わるたびに実行される
);

const { data: searchResults, loading: searchLoading } = useAsyncState(
  (signal) => searchUsersUseCase.execute(query, signal),
  [query] // ❌ queryが変わるたびに実行される
);
```

**問題点**:
- 依存配列の変更で意図しない実行が発生
- Loading状態の管理が複雑（3つのloading状態）
- ボタンクリック時の実行制御が困難

### 推奨パターン: 操作の性質で使い分ける

```typescript
// ✅ 良い例

// パターンA: 初期表示時に自動実行 → useAsyncState
const { data: users, loading, error, refetch } = useAsyncState(
  (signal) => getUsersUseCase.execute(signal),
  []
);

// パターンB: ユーザーアクション時に実行 → 手動制御
const [createLoading, setCreateLoading] = useState(false);
const [createError, setCreateError] = useState<RepositoryError | null>(null);

const handleCreateUser = async (name: string, email: string) => {
  setCreateLoading(true);
  setCreateError(null);

  const result = await createUserUseCase.execute(name, email);

  setCreateLoading(false);

  if (result.isError()) {
    setCreateError(result.getError());
  } else {
    // 成功したら一覧を再取得
    refetch();
  }
};

// パターンC: デバウンス付き検索 → カスタムフック
const { results: searchResults, searching } = useDebouncedSearch(
  query,
  (q, signal) => searchUsersUseCase.execute(q, signal)
);
```

### useAsyncの呼び出し回数ガイドライン

| 操作の種類 | useAsync使用 | 推奨アプローチ | 理由 |
|-----------|------------|--------------|------|
| 初期表示時のデータ取得 | ✅ YES | useAsyncState | 自動実行とクリーンアップが必要 |
| ボタンクリックでの作成/更新/削除 | ❌ NO | 手動実装（useState + async function） | イベント駆動、実行タイミングが明確 |
| 入力フィールドでの検索（デバウンス） | ⚠️ MAYBE | カスタムフック（useDebouncedSearch） | 依存配列での自動実行が必要だが特殊処理も必要 |
| ポーリング | ❌ NO | usePolling | 専用のフックが必要 |
| 複数API並列/逐次実行 | ❌ NO | useMultipleAsync | 専用のフックが必要 |

## 結論

### 複数Repositoryを使う場合の推奨アプローチ

**シンプルなケース（並列実行のみ、進行状況不要）**:
```typescript
// UseCase作成
GetUserPostsSummaryUseCase → 複数Repositoryをラップ
↓
// Component
useAsyncState((signal) => useCase.execute(signal))
```

**複雑なケース（並列/逐次選択、進行状況表示）**:
```typescript
// 個別のUseCaseは再利用
GetUsersUseCase, GetPostsUseCase
↓
// カスタムフックでデータ結合ロジックを定義
useUserPostsSummary → UserPostsSummaryDto作成
↓
// Component
useUserPostsSummary() → executeParallel/executeSequential選択
```

### useAsyncの呼び出し回数

**原則**:
- **1コンポーネント = 0〜2回のuseAsync呼び出し**が適切
- 0回: すべてボタンクリックなどのイベント駆動
- 1回: 初期データ取得のみ
- 2回: 初期データ + デバウンス検索など
- 3回以上: 設計の見直しが必要（状態管理が複雑すぎる）

**判断基準**:
1. マウント時に自動実行が必要 → useAsync系を使う
2. ユーザーアクション時に実行 → 手動実装
3. 複数の非同期操作を組み合わせ → 専用カスタムフック

### 現在のMultipleApiTestの改善案

**現状維持でOK**: 学習目的なら、以下の理由で現状のままで問題ない
- 並列/逐次の比較がこのコンポーネントの目的
- 進行状況の可視化が重要
- ビジネスロジックは単純（データ結合のみ）

**本番適用なら改善**: 実際のプロダクションコードなら
- UserPostsSummaryDtoを作成（型安全性）
- カスタムフック（useUserPostsSummary）でcombinerを隠蔽（再利用性）
- 必要ならUseCaseでラップ（テスタビリティ）
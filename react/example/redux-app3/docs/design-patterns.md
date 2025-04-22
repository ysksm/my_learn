# CRMシステム デザインパターン解説

このドキュメントでは、CRMシステムで使用されている主要なデザインパターンについて詳細に解説します。

## 1. レイヤードアーキテクチャパターン

CRMシステムは、クリーンアーキテクチャの原則に基づいたレイヤードアーキテクチャパターンを採用しています。

### 実装詳細

システムは以下の4つの主要なレイヤーで構成されています：

1. **ドメインレイヤー** (`src/domain/`)
   - ビジネスエンティティとビジネスロジックを含む
   - 外部依存関係を持たない
   - 例: `Account`, `Product`, `Opportunity`, `Activity` エンティティ

2. **インフラストラクチャレイヤー** (`src/infrastructure/`)
   - ドメインレイヤーで定義されたリポジトリインターフェースの実装
   - 外部システム（LocalStorage）との連携
   - 例: `LocalStorageRepository` クラス

3. **アプリケーションレイヤー** (`src/application/`)
   - ユースケースの実装（Redux Slices）
   - ドメインレイヤーとプレゼンテーションレイヤーの橋渡し
   - 例: `accountSlice`, `productSlice` など

4. **プレゼンテーションレイヤー** (`src/presentation/`)
   - ユーザーインターフェース（React Components）
   - ユーザー入力の処理とデータの表示
   - 例: `AccountsPage`, `ProductsPage` など

### メリット

- **関心の分離**: 各レイヤーは明確に分離されており、それぞれの責任が明確です。
- **依存関係の方向**: 依存関係は内側に向かっており、ドメインレイヤーは外部に依存しません。
- **テスト容易性**: 各レイヤーは独立してテスト可能です。
- **拡張性**: 新しいエンティティや機能を追加する際の変更範囲が限定的です。

## 2. リポジトリパターン

データアクセスを抽象化し、ドメインロジックとデータアクセスを分離するためにリポジトリパターンを採用しています。

### 実装詳細

- **リポジトリインターフェース** (`src/domain/repository/repository.ts`)
  ```typescript
  export interface Repository<T extends Entity> {
    save(entity: T): Promise<T>;
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    // その他のメソッド...
  }
  ```

- **具体的なリポジトリ実装** (`src/infrastructure/persistence/local-storage-repository.ts`)
  ```typescript
  export class LocalStorageRepository<T extends Entity> implements Repository<T> {
    private readonly storageKey: string;

    constructor(entityName: string) {
      this.storageKey = `crm_${entityName}`;
    }
    
    // メソッド実装...
  }
  ```

### メリット

- **データアクセスの抽象化**: データの取得・保存方法の詳細をドメインロジックから隠蔽します。
- **テスト容易性**: モックリポジトリを使用してドメインロジックをテストできます。
- **実装の交換可能性**: 将来的にLocalStorageからAPIに変更する場合でも、インターフェースを維持したまま実装を変更できます。

## 3. ファクトリーメソッドパターン

各ドメインエンティティには、新しいインスタンスを作成するためのファクトリーメソッドが実装されています。

### 実装詳細

- **Account エンティティのファクトリーメソッド** (`src/domain/model/account.ts`)
  ```typescript
  export function createAccount(dto: CreateAccountDTO): Account {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      ...dto,
      createdAt: now,
      updatedAt: now,
    };
  }
  ```

- **Opportunity エンティティのファクトリーメソッド** (`src/domain/model/opportunity.ts`)
  ```typescript
  export function createOpportunity(dto: CreateOpportunityDTO): Opportunity {
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      ...dto,
      stage: dto.stage ?? OpportunityStage.PROSPECTING,
      createdAt: now,
      updatedAt: now,
    };
  }
  ```

### メリット

- **オブジェクト生成の一元化**: エンティティの生成ロジックを一箇所に集約します。
- **デフォルト値の設定**: IDの生成やタイムスタンプの設定などの共通ロジックを一元管理できます。
- **ビジネスルールの適用**: 生成時に必要なビジネスルールを適用できます（例: 商談ステージのデフォルト値）。

## 4. コマンドパターン

Reduxアクションとリデューサーを通じて、コマンドパターンが実装されています。

### 実装詳細

- **アクションの定義** (`src/application/store/slices/account-slice.ts`)
  ```typescript
  export const createAccountAsync = createAsyncThunk(
    'accounts/create',
    async (dto: CreateAccountDTO) => {
      const newAccount = createAccount(dto);
      return await accountRepository.save(newAccount);
    }
  );
  ```

- **リデューサーの実装**
  ```typescript
  const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
      // 同期アクション
      clearSelectedAccount: (state) => {
        state.selectedAccount = null;
      },
    },
    extraReducers: (builder) => {
      // 非同期アクションのハンドラー
      builder
        .addCase(createAccountAsync.fulfilled, (state, action) => {
          state.loading = false;
          state.accounts.push(action.payload);
          state.selectedAccount = action.payload;
        })
        // その他のケース...
    },
  });
  ```

### メリット

- **操作の抽象化**: ユーザーアクションを抽象化し、再利用可能なコマンドとして実装できます。
- **状態変更の一元管理**: すべての状態変更はリデューサーを通じて行われるため、予測可能性が高まります。
- **非同期処理の統一**: Redux Thunkを使用して非同期処理を統一的に扱えます。

## 5. オブザーバーパターン

ReduxのストアとReactコンポーネント間の関係は、オブザーバーパターンに基づいています。

### 実装詳細

- **ストアの状態監視** (`src/presentation/pages/AccountsPage.tsx`)
  ```typescript
  const { accounts, loading, error } = useAppSelector(state => state.accounts);
  ```

- **状態変更の通知**
  ```typescript
  // Reduxアクションのディスパッチ
  dispatch(createAccountAsync(formData));
  ```

### メリット

- **UI更新の自動化**: ストアの状態が変更されると、関連するコンポーネントが自動的に再レンダリングされます。
- **状態の一元管理**: アプリケーションの状態が一箇所で管理されるため、デバッグが容易になります。
- **コンポーネント間の疎結合**: コンポーネント間で直接データをやり取りする必要がなくなります。

## 6. プロキシパターン

LocalStorageリポジトリはドメインリポジトリのプロキシとして機能します。

### 実装詳細

- **リポジトリインターフェース** (`src/domain/repository/account-repository.ts`)
  ```typescript
  export interface AccountRepository extends Repository<Account> {
    // 追加のメソッドがあれば定義
  }
  ```

- **プロキシ実装** (`src/infrastructure/persistence/local-storage-account-repository.ts`)
  ```typescript
  export class LocalStorageAccountRepository extends LocalStorageRepository<Account> implements AccountRepository {
    constructor() {
      super('accounts');
    }
    
    // 追加のメソッド実装
  }
  ```

### メリット

- **アクセス制御**: データアクセスの前後に追加の処理を挿入できます。
- **キャッシュ機能**: 必要に応じてデータのキャッシュを実装できます。
- **実装の透過性**: クライアントコードは実際の実装を意識せずにリポジトリを使用できます。

## 7. アダプターパターン

LocalStorageリポジトリはアダプターパターンを使用して、LocalStorageのAPIをリポジトリインターフェースに適合させています。

### 実装詳細

- **LocalStorageリポジトリの実装**
  ```typescript
  async findAll(): Promise<T[]> {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error parsing ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }
  ```

### メリット

- **インターフェースの変換**: 異なるインターフェースを持つシステム間の連携を可能にします。
- **既存コードの再利用**: 既存のAPIやライブラリを変更せずに利用できます。
- **依存関係の分離**: 外部システムへの依存を隔離します。

## 8. 複合パターン（Composite Pattern）

アプリケーション全体は、複数のデザインパターンを組み合わせた複合パターンとして実装されています。

### 実装詳細

- **クリーンアーキテクチャ**: レイヤー間の依存関係を管理
- **リポジトリパターン**: データアクセスを抽象化
- **Redux**: 状態管理とアクション処理
- **React**: コンポーネントベースのUI構築

### メリット

- **関心の分離**: 各パターンが特定の問題領域に対処します。
- **保守性の向上**: 変更の影響範囲が限定されます。
- **拡張性**: 新機能の追加が容易になります。

## 9. 将来の拡張可能性

このアーキテクチャは以下のようなパターンの追加にも対応できます：

1. **ストラテジーパターン**: 異なるデータ永続化戦略を切り替えるために使用できます。
2. **デコレーターパターン**: リポジトリに追加機能（ロギング、キャッシュなど）を動的に追加するために使用できます。
3. **メディエーターパターン**: コンポーネント間の通信を一元化するために使用できます。

## まとめ

CRMシステムは、複数のデザインパターンを組み合わせることで、保守性、拡張性、テスト容易性に優れたアーキテクチャを実現しています。各パターンは特定の問題領域に対処し、全体として一貫性のあるシステムを構築しています。

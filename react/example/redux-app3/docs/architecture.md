# CRMシステム アーキテクチャドキュメント

## 1. 概要

このCRMシステムは、取引先、納入商品、商談、活動を管理するためのReactアプリケーションです。クリーンアーキテクチャの原則に基づいて設計されており、ドメイン駆動設計（DDD）のコンセプトを取り入れています。

## 2. アーキテクチャ概要

このアプリケーションは以下の4つの主要なレイヤーで構成されています：

```
+-------------------+
|   Presentation    |  ユーザーインターフェース（React Components）
+-------------------+
          ↑
          ↓
+-------------------+
|   Application     |  アプリケーションロジック（Redux Store）
+-------------------+
          ↑
          ↓
+-------------------+
|     Domain        |  ビジネスロジック（Models, Repositories）
+-------------------+
          ↑
          ↓
+-------------------+
| Infrastructure    |  外部システムとの連携（LocalStorage）
+-------------------+
```

### 2.1 レイヤー説明

1. **ドメインレイヤー**
   - ビジネスエンティティとビジネスロジックを含む
   - リポジトリインターフェースを定義
   - 外部依存関係を持たない

2. **インフラストラクチャレイヤー**
   - ドメインレイヤーで定義されたリポジトリインターフェースの実装
   - データの永続化（LocalStorage）を担当

3. **アプリケーションレイヤー**
   - ユースケースの実装（Redux Slices）
   - ドメインレイヤーとプレゼンテーションレイヤーの橋渡し

4. **プレゼンテーションレイヤー**
   - ユーザーインターフェース（React Components）
   - ユーザー入力の処理とデータの表示

## 3. ドメインモデル

アプリケーションは以下の主要なドメインエンティティで構成されています：

### 3.1 共通型

```typescript
// ID型
export type ID = string;

// エンティティの基本インターフェース
export interface Entity {
  id: ID;
}

// タイムスタンプ付きエンティティ
export interface TimestampedEntity extends Entity {
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 取引先（Account）

取引先は企業や組織を表現するエンティティです。

```typescript
export interface Account extends TimestampedEntity {
  name: string;
  industry: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}
```

### 3.3 納入商品（Product）

納入商品は販売または提供する製品やサービスを表現するエンティティです。

```typescript
export interface Product extends TimestampedEntity {
  name: string;
  price: number;
  code?: string;
  description?: string;
  category?: string;
  isActive: boolean;
}
```

### 3.4 商談（Opportunity）

商談は潜在的な販売機会を表現するエンティティです。

```typescript
export interface Opportunity extends TimestampedEntity {
  accountId: ID;
  name: string;
  stage: OpportunityStage;
  amount: number;
  closeDate?: string;
  probability?: number;
  description?: string;
}
```

商談ステージは以下の列挙型で定義されています：

```typescript
export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  VALUE_PROPOSITION = 'value_proposition',
  DECISION_MAKERS = 'decision_makers',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}
```

### 3.5 活動（Activity）

活動は取引先や商談に関連するタスクやイベントを表現するエンティティです。

```typescript
export interface Activity extends TimestampedEntity {
  relatedTo: RelatedTo;
  type: ActivityType;
  subject: string;
  date: string;
  dueDate?: string;
  status?: 'planned' | 'completed' | 'canceled';
  description?: string;
  assignedTo?: string;
}
```

活動タイプと関連先は以下の列挙型で定義されています：

```typescript
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
}

export enum RelatedToType {
  ACCOUNT = 'account',
  OPPORTUNITY = 'opportunity',
}

export interface RelatedTo {
  type: RelatedToType;
  id: ID;
}
```

## 4. リポジトリパターン

アプリケーションはリポジトリパターンを使用してデータアクセスを抽象化しています。

### 4.1 リポジトリインターフェース

```typescript
export interface Repository<T extends Entity> {
  save(entity: T): Promise<T>;
  saveAll(entities: T[]): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  findBy(predicate: (entity: T) => boolean): Promise<T[]>;
  deleteById(id: ID): Promise<boolean>;
  delete(entity: T): Promise<boolean>;
  deleteAll(): Promise<boolean>;
}
```

### 4.2 LocalStorage実装

リポジトリの実装はLocalStorageを使用してデータを永続化します。

```typescript
export class LocalStorageRepository<T extends Entity> implements Repository<T> {
  private readonly storageKey: string;

  constructor(entityName: string) {
    this.storageKey = `crm_${entityName}`;
  }
  
  // メソッド実装...
}
```

## 5. 状態管理（Redux）

アプリケーションはReduxを使用して状態を管理しています。各ドメインエンティティに対応するスライスが定義されています。

### 5.1 ストア構成

```typescript
export const store = configureStore({
  reducer: {
    accounts: accountReducer,
    products: productReducer,
    opportunities: opportunityReducer,
    activities: activityReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
```

### 5.2 スライス例（Account）

各スライスは以下の要素で構成されています：
- 状態の型定義
- 初期状態
- 非同期アクション（createAsyncThunk）
- リデューサー

```typescript
// 状態の型定義
interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
}

// 非同期アクション
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async () => {
    return await accountRepository.findAll();
  }
);

// スライスの作成
const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // 同期アクション
  },
  extraReducers: (builder) => {
    // 非同期アクションのハンドラー
  },
});
```

## 6. データフロー

アプリケーションのデータフローは以下のようになります：

```
+----------------+    +----------------+    +----------------+
|                |    |                |    |                |
|  User Actions  | -> |  Redux Store   | -> |  React Views   |
|                |    |                |    |                |
+----------------+    +----------------+    +----------------+
        |                     |
        v                     v
+----------------+    +----------------+
|                |    |                |
|  Redux Thunks  | -> |  Repositories  |
|                |    |                |
+----------------+    +----------------+
                             |
                             v
                      +----------------+
                      |                |
                      |  LocalStorage  |
                      |                |
                      +----------------+
```

1. ユーザーがUIで操作を行う（例：フォーム送信）
2. Reduxアクション（同期または非同期）がディスパッチされる
3. 非同期アクションの場合、リポジトリメソッドが呼び出される
4. リポジトリがLocalStorageとやり取りしてデータを永続化
5. 操作の結果がRedux Storeに反映される
6. Storeの変更に応じてUIが更新される

### 6.1 LocalStorage同期

複数のタブ間でデータを同期するために、LocalStorageのイベントリスナーが実装されています。

```typescript
export const useLocalStorageSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) return;

      if (event.key === 'crm_accounts') {
        dispatch(fetchAccounts());
      } else if (event.key === 'crm_products') {
        dispatch(fetchProducts());
      } else if (event.key === 'crm_opportunities') {
        dispatch(fetchOpportunities());
      } else if (event.key === 'crm_activities') {
        dispatch(fetchActivities());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);
};
```

## 7. UIコンポーネント構造

アプリケーションのUIは以下のコンポーネント構造で構成されています：

```
App
├── Provider (Redux)
├── Router
│   ├── LocalStorageSyncComponent
│   ├── Navbar
│   └── Routes
│       ├── HomePage
│       ├── AccountsPage
│       ├── ProductsPage
│       ├── OpportunitiesPage
│       └── ActivitiesPage
```

各ページコンポーネントは以下の機能を提供します：
- データの一覧表示
- 新規作成フォーム
- 編集フォーム
- 削除機能

## 8. 使用されているデザインパターン

### 8.1 リポジトリパターン
データアクセスを抽象化し、ドメインロジックとデータアクセスを分離します。

### 8.2 ファクトリーメソッドパターン
各ドメインエンティティには、新しいインスタンスを作成するためのファクトリーメソッドが実装されています。

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

### 8.3 コマンドパターン
Reduxアクションとリデューサーを通じて、コマンドパターンが実装されています。

### 8.4 オブザーバーパターン
ReduxのストアとReactコンポーネント間の関係は、オブザーバーパターンに基づいています。

### 8.5 プロキシパターン
LocalStorageリポジトリはドメインリポジトリのプロキシとして機能します。

## 9. 拡張性と保守性

このアーキテクチャは以下の点で拡張性と保守性に優れています：

1. **関心の分離**: 各レイヤーは明確に分離されており、それぞれの責任が明確です。
2. **依存関係の方向**: 依存関係は内側に向かっており、ドメインレイヤーは外部に依存しません。
3. **インターフェースによる抽象化**: リポジトリインターフェースにより、実装の詳細を隠蔽しています。
4. **テスト容易性**: 各レイヤーは独立してテスト可能です。
5. **拡張性**: 新しいエンティティや機能を追加する際の変更範囲が限定的です。

## 10. 将来の拡張可能性

このアーキテクチャは以下のような拡張に対応できます：

1. **バックエンドAPIとの連携**: LocalStorageリポジトリをAPIリポジトリに置き換えることで、サーバーとの連携が可能です。
2. **認証機能の追加**: ユーザー認証のためのレイヤーを追加できます。
3. **高度な検索機能**: リポジトリに検索機能を拡張できます。
4. **レポート機能**: 既存のデータモデルを活用したレポート機能を追加できます。
5. **通知システム**: イベント駆動型の通知システムを実装できます。

## 11. まとめ

このCRMシステムは、クリーンアーキテクチャとドメイン駆動設計の原則に基づいて設計されています。明確に分離されたレイヤー、ドメインモデル中心の設計、リポジトリパターンによるデータアクセスの抽象化により、拡張性と保守性に優れたアプリケーションとなっています。

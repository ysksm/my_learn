# アーキテクチャ概要

## 概要

このTodoアプリケーションは、**レイヤードアーキテクチャ** と **ドメイン駆動設計（DDD）** の原則に基づいて設計されています。

## アーキテクチャ原則

### 1. 依存性逆転の原則（DIP: Dependency Inversion Principle）

- 上位層は下位層の**インターフェース**に依存する
- 下位層は上位層に依存しない
- Infrastructure層はDomain層のインターフェースを実装する

### 2. 依存性注入（DI: Dependency Injection）

- DIコンテナを使用してリポジトリのインスタンスを管理
- UseCase層は具体的な実装を知らない
- テスト時や実装切り替えが容易

### 3. 関心の分離（Separation of Concerns）

各レイヤーは明確な責務を持つ：
- **Domain層**: ビジネスロジックとルール
- **Application層**: ユースケースの実装
- **Infrastructure層**: 外部リソースへのアクセス
- **Presentation層**: UI とユーザーインタラクション

## レイヤー構造

```
┌─────────────────────────────────┐
│     Presentation Layer          │  React Components, Hooks
│     (src/presentation)          │
└────────────┬────────────────────┘
             │ 依存
             ↓
┌─────────────────────────────────┐
│     Application Layer           │  Use Cases, DI Container
│     (src/application)           │
└────────────┬────────────────────┘
             │ 依存
             ↓
┌─────────────────────────────────┐
│     Domain Layer                │  Entities, Value Objects,
│     (src/domain)                │  Repository Interfaces
└────────────┬────────────────────┘
             ↑ 実装
             │
┌─────────────────────────────────┐
│     Infrastructure Layer        │  Repository Implementations
│     (src/infrastructure)        │
└─────────────────────────────────┘
```

## ディレクトリ構造

```
src/
├── domain/                      # Domain層
│   ├── models/                 # エンティティとバリューオブジェクト
│   │   ├── Todo.ts            # Todoエンティティ
│   │   ├── TodoStatus.ts      # ステータス型定義
│   │   └── Assignee.ts        # 担当者バリューオブジェクト
│   └── repositories/           # リポジトリインターフェース
│       └── TodoRepository.ts   # Todoリポジトリの契約
│
├── application/                 # Application層
│   ├── usecases/               # ユースケース
│   │   ├── GetTodosUseCase.ts
│   │   ├── UpdateTodoStatusUseCase.ts
│   │   └── UpdateTodoAssigneeUseCase.ts
│   └── di/                     # 依存性注入
│       └── container.ts        # DIコンテナ
│
├── infrastructure/              # Infrastructure層
│   └── repositories/           # リポジトリ実装
│       └── LocalStorageTodoRepository.ts
│
└── presentation/                # Presentation層
    ├── components/             # Reactコンポーネント
    │   ├── TodoList.tsx
    │   ├── TodoItem.tsx
    │   └── AssigneeSelector.tsx
    └── hooks/                  # カスタムフック
        └── useTodoPolling.ts
```

## データフロー

### 1. Todo取得フロー
```
User → App.tsx → GetTodosUseCase → TodoRepository → LocalStorage
                                                           ↓
User ← TodoList ← App.tsx ← [Todo[]] ← TodoRepository ← データ読み込み
```

### 2. Todo更新フロー
```
User → TodoItem → UpdateTodoStatusUseCase → TodoRepository → LocalStorage
       ↓ onChange                                                  ↓
       onUpdate() → fetchTodos() → GetTodosUseCase → 再取得 → UI更新
```

### 3. 複数タブ同期フロー
```
Tab A: User → 変更 → LocalStorage保存
                          ↓
Tab B: Polling(5秒) → GetTodosUseCase → LocalStorageから読み込み → UI更新
```

## 主要な設計パターン

### 1. Repository Pattern

**目的**: データアクセスロジックをドメインロジックから分離

**実装**:
- Domain層: インターフェース定義（`TodoRepository`）
- Infrastructure層: 具体的な実装（`LocalStorageTodoRepository`）

### 2. Use Case Pattern

**目的**: アプリケーション固有のビジネスルールをカプセル化

**実装**:
- `GetTodosUseCase`: Todo一覧取得
- `UpdateTodoStatusUseCase`: 状態更新
- `UpdateTodoAssigneeUseCase`: 担当者更新

### 3. Dependency Injection Pattern

**目的**: 疎結合な設計を実現

**実装**:
- `container.ts`: シングルトンパターンでリポジトリを管理
- UseCaseはコンストラクタでリポジトリを注入される

## 技術スタック

### フロントエンド
- **React 19**: UIライブラリ
- **TypeScript**: 型安全性
- **Vite (rolldown-vite)**: ビルドツール

### データ永続化
- **LocalStorage**: ブラウザストレージ
- ポーリング（5秒間隔）で自動同期

### アーキテクチャパターン
- **Layered Architecture**: 4層構造
- **Domain-Driven Design**: エンティティ中心設計
- **SOLID原則**: 特にDIPとSRP

## 将来の拡張性

### 簡単に実装を切り替えられる箇所

1. **リポジトリの切り替え**
   - `container.ts`を変更するだけ
   - LocalStorage → API通信への移行が容易

2. **新しいユースケースの追加**
   - Application層に新しいUseCaseクラスを追加
   - 既存のコードを変更する必要なし

3. **UIの変更**
   - Presentation層のみを変更
   - ビジネスロジックへの影響なし

## 設計の利点

✅ **テスタビリティ**: 各層を独立してテスト可能
✅ **保守性**: 関心の分離により変更の影響範囲が限定的
✅ **拡張性**: 新機能追加が容易
✅ **可読性**: レイヤー構造が明確
✅ **再利用性**: Domain層とApplication層は他のUIでも利用可能

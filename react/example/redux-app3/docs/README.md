# CRMシステム 設計ドキュメント

## 概要

このドキュメントセットは、CRMシステムの設計と実装に関する詳細な情報を提供します。CRMシステムは、取引先、納入商品、商談、活動を管理するためのReactアプリケーションで、クリーンアーキテクチャの原則に基づいて設計されています。

## ドキュメント一覧

1. [アーキテクチャ概要](architecture.md)
   - システム全体のアーキテクチャ
   - レイヤー構成
   - ドメインモデル
   - データフロー
   - 拡張性と保守性

2. [クラス図](class-diagram.md)
   - ドメインモデルのクラス図
   - リポジトリのクラス図
   - Redux状態管理のクラス図
   - コンポーネント構造のクラス図

3. [シーケンス図](sequence-diagram.md)
   - データ作成フロー
   - データ取得フロー
   - データ更新フロー
   - データ削除フロー
   - タブ間同期フロー

4. [デザインパターン解説](design-patterns.md)
   - レイヤードアーキテクチャパターン
   - リポジトリパターン
   - ファクトリーメソッドパターン
   - コマンドパターン
   - オブザーバーパターン
   - プロキシパターン
   - アダプターパターン
   - 複合パターン

## システム構成

CRMシステムは以下の主要なコンポーネントで構成されています：

### ドメインレイヤー (`src/domain/`)

- **モデル**: ビジネスエンティティとビジネスロジック
  - `Account`: 取引先エンティティ
  - `Product`: 納入商品エンティティ
  - `Opportunity`: 商談エンティティ
  - `Activity`: 活動エンティティ

- **リポジトリ**: データアクセスのインターフェース
  - `Repository<T>`: 基本リポジトリインターフェース
  - `AccountRepository`: 取引先リポジトリインターフェース
  - `ProductRepository`: 納入商品リポジトリインターフェース
  - `OpportunityRepository`: 商談リポジトリインターフェース
  - `ActivityRepository`: 活動リポジトリインターフェース

### インフラストラクチャレイヤー (`src/infrastructure/`)

- **永続化**: リポジトリの実装
  - `LocalStorageRepository<T>`: LocalStorageを使用した基本リポジトリ実装
  - `LocalStorageAccountRepository`: 取引先リポジトリの実装
  - `LocalStorageProductRepository`: 納入商品リポジトリの実装
  - `LocalStorageOpportunityRepository`: 商談リポジトリの実装
  - `LocalStorageActivityRepository`: 活動リポジトリの実装

### アプリケーションレイヤー (`src/application/`)

- **ストア**: Redux状態管理
  - `store`: Reduxストアの設定
  - `accountSlice`: 取引先の状態管理
  - `productSlice`: 納入商品の状態管理
  - `opportunitySlice`: 商談の状態管理
  - `activitySlice`: 活動の状態管理

### プレゼンテーションレイヤー (`src/presentation/`)

- **コンポーネント**: UIコンポーネント
  - `Navbar`: ナビゲーションバー

- **ページ**: 画面コンポーネント
  - `AccountsPage`: 取引先一覧・編集画面
  - `ProductsPage`: 納入商品一覧・編集画面
  - `OpportunitiesPage`: 商談一覧・編集画面
  - `ActivitiesPage`: 活動一覧・編集画面

- **フック**: カスタムReactフック
  - `useLocalStorageSync`: LocalStorage変更の同期フック

## 技術スタック

- **フロントエンド**: React, TypeScript
- **状態管理**: Redux Toolkit
- **ルーティング**: React Router
- **データ永続化**: LocalStorage
- **スタイリング**: CSS

## 将来の拡張可能性

このアーキテクチャは以下のような拡張に対応できます：

1. **バックエンドAPIとの連携**: LocalStorageリポジトリをAPIリポジトリに置き換えることで、サーバーとの連携が可能です。
2. **認証機能の追加**: ユーザー認証のためのレイヤーを追加できます。
3. **高度な検索機能**: リポジトリに検索機能を拡張できます。
4. **レポート機能**: 既存のデータモデルを活用したレポート機能を追加できます。
5. **通知システム**: イベント駆動型の通知システムを実装できます。

# React Async Learning Project

React で非同期処理を学ぶためのサンプル実装プロジェクト。Pure React と RxJS の2つのアプローチを比較しながら、効果的な非同期処理パターンを学習できます。

## 🎯 プロジェクト概要

このプロジェクトは、Reactアプリケーションにおける非同期処理の様々なパターンとベストプラクティスを実践的に学ぶためのものです。

### 主な特徴

- **2つの実装アプローチ**: Pure React vs RxJS
- **DDD + レイヤードアーキテクチャ**: 実際のプロジェクトで使える設計パターン
- **包括的な非同期パターン**: API呼び出し、ポーリング、タイムアウト、複数API処理
- **側面比較**: 同じ機能を異なる手法で実装し比較

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
# メインプロジェクト
npm install

# バックエンドAPI
cd test/backend
npm install
```

### 2. 開発サーバーの起動

```bash
# バックエンドAPI (ポート3001)
cd test/backend
npm run dev

# フロントエンド (ポート5173) - 別ターミナルで実行
npm run dev
```

### 3. アプリケーションへのアクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3001

## 📁 プロジェクト構成

```
src/
├── domain/              # ドメイン層
│   ├── entities/        # エンティティ
│   ├── repositories/    # リポジトリインターフェース
│   └── services/        # ドメインサービス
├── infrastructure/     # インフラ層
│   ├── api/            # APIクライアント
│   ├── repositories/   # リポジトリ実装
│   └── di/             # 依存性注入
├── application/        # アプリケーション層
│   ├── usecases/       # ユースケース
│   └── dto/            # データ転送オブジェクト
├── pure-react/         # Pure React実装
│   ├── hooks/          # カスタムフック
│   ├── components/     # コンポーネント
│   └── pages/          # ページ
├── rxjs/              # RxJS実装
│   ├── hooks/          # RxJSベースフック
│   ├── components/     # コンポーネント
│   ├── services/       # RxJSサービス
│   └── pages/          # ページ
└── comparison/         # 比較ページ
    └── pages/

test/backend/           # Express.js API サーバー
├── src/
│   ├── routes/         # APIルート
│   ├── types/          # 型定義
│   └── server.ts       # メインサーバー
└── package.json

docs/                   # ドキュメント
├── requirement.md      # 要件定義
├── plan.md            # 実装計画
└── react_async.md     # React非同期処理解説
```

## 🔧 実装されている機能

### 1. 基本的なAPIコール
- ユーザーデータの取得・表示
- エラーハンドリング
- ローディング状態管理

### 2. ポーリング
- 定期的なデータ更新
- 開始/停止制御
- 自動クリーンアップ

### 3. タイムアウト処理
- 設定可能な遅延テスト
- タイムアウト制御
- 手動キャンセル

### 4. 複数API処理
- 並行実行（Promise.all / combineLatest）
- 逐次実行（async/await / concat）
- 進行状況表示

## 🆚 実装アプローチの比較

| 項目 | Pure React | RxJS |
|------|------------|------|
| 学習コスト | 低 | 高 |
| コードの可読性 | 命令的 | 宣言的 |
| バンドルサイズ | 小 | 大 |
| エラーハンドリング | 手動 | オペレーター |
| キャンセル処理 | AbortController | unsubscribe |
| 時間ベース操作 | 手動実装 | 豊富なオペレーター |

## 🎓 学習ポイント

### Pure React アプローチ
- `useState`、`useEffect`、`useCallback`の効果的な使用
- AbortControllerによるキャンセル処理
- カスタムフックによる抽象化
- Promise.allとPromise.raceの活用

### RxJS アプローチ
- Observableとオペレーターの理解
- `switchMap`、`combineLatest`、`timeout`等の活用
- エラーハンドリングパターン
- リアクティブプログラミングの考え方

### 共通項目
- DDD（ドメイン駆動設計）の実践
- レイヤードアーキテクチャの構築
- TypeScriptによる型安全性
- Result パターンによるエラーハンドリング

## 📚 関連ドキュメント

- [要件定義](./docs/requirement.md)
- [実装計画](./docs/plan.md)
- [React非同期処理の難しさと対策](./docs/react_async.md)
- [Claude Code設定](./CLAUDE.md)

## 🛠️ 開発コマンド

```bash
# フロントエンド
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLint実行
npm run preview      # ビルド結果のプレビュー

# バックエンド
cd test/backend
npm run dev          # 開発サーバー起動
npm run build        # TypeScriptコンパイル
npm start            # 本番サーバー起動
```

## 🎯 学習目標

このプロジェクトを通じて以下のスキルを習得できます：

1. **React非同期処理のベストプラクティス**
2. **エラーハンドリングとキャンセル処理**
3. **DDD + レイヤードアーキテクチャの実装**
4. **RxJSによるリアクティブプログラミング**
5. **TypeScriptによる型安全な開発**

## 💡 次のステップ

- Server-Sent Events (SSE) の実装
- WebSocket による双方向通信
- React Query や SWR との比較
- パフォーマンス最適化の実践

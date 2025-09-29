# 実装計画

## プロジェクト概要
Reactで非同期処理を学ぶためのサンプル実装プロジェクト

## 実装フェーズ

### Phase 1: バックエンドAPI実装
- [ ] `test/backend` ディレクトリの作成
- [ ] Express.jsによるAPI サーバーの基盤構築
- [ ] 基本的なデータ取得API エンドポイント実装
- [ ] ポーリング用のデータ更新API実装
- [ ] タイムアウトテスト用の遅延API実装
- [ ] 複数APIコール検証用のエンドポイント群実装

### Phase 2: フロントエンド基盤（DDD + レイヤードアーキテクチャ）
- [ ] ドメイン層の設計・実装
  - [ ] エンティティの定義
  - [ ] IRepositoryインターフェースの設計（異常系強制）
  - [ ] ドメインサービスの実装
- [ ] インフラストラクチャ層の実装
  - [ ] APIクライアントの実装
  - [ ] Repositoryの具象実装
- [ ] アプリケーション層の実装
  - [ ] ユースケースの実装
  - [ ] DTOの定義
- [ ] プレゼンテーション層の実装
  - [ ] React コンポーネントの基盤

### Phase 3: Pure React実装
- [ ] 基本的なAPIコール実装
  - [ ] useState + useEffect パターン
  - [ ] エラーハンドリング
  - [ ] ローディング状態管理
- [ ] ポーリング実装
  - [ ] setInterval を使った定期実行
  - [ ] コンポーネントアンマウント時のクリーンアップ
- [ ] キャンセル処理実装
  - [ ] AbortController を使った中断処理
  - [ ] useEffect のクリーンアップ関数活用
- [ ] 複数APIコール実装
  - [ ] Promise.all による並行処理
  - [ ] 連続処理（依存関係のあるAPI呼び出し）
- [ ] タイムアウト処理実装
  - [ ] Promise.race を使った時間制限

### Phase 4: RxJS実装
- [ ] RxJS セットアップ
  - [ ] 依存関係の追加
  - [ ] React との統合パターン実装
- [ ] Observable ベースの実装
  - [ ] 基本的なAPIコール（from, switchMap）
  - [ ] ポーリング（interval, switchMap）
  - [ ] キャンセル処理（takeUntil）
  - [ ] タイムアウト処理（timeout operator）
  - [ ] 複数APIコール（combineLatest, forkJoin）

### Phase 5: 比較・検証
- [ ] Pure React vs RxJS 実装の比較ページ作成
- [ ] パフォーマンステスト実装
- [ ] エラーハンドリングパターンの比較
- [ ] メモリリーク検証

### Phase 6: ドキュメント作成
- [ ] `docs/react_async.md` の作成
  - [ ] Reactの非同期処理の難しさ
  - [ ] よくあるアンチパターン
  - [ ] ベストプラクティス
- [ ] 実装パターンごとのREADME作成
- [ ] コードコメントの充実

## 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite（ビルドツール）
- RxJS（Phase 4で追加）

### バックエンド
- Express.js + TypeScript
- CORS対応

### 開発ツール
- ESLint（コード品質）
- Prettier（コードフォーマット）

## ディレクトリ構成（予定）

```
src/
├── domain/          # ドメイン層
│   ├── entities/
│   ├── repositories/
│   └── services/
├── infrastructure/ # インフラ層
│   └── repositories/
├── application/    # アプリケーション層
│   └── usecases/
├── presentation/   # プレゼンテーション層
│   ├── components/
│   ├── pages/
│   └── hooks/
├── pure-react/     # Pure React実装
└── rxjs/          # RxJS実装

test/
└── backend/       # Express API サーバー
    ├── routes/
    └── middleware/
```

## 成果物
- 動作するWebアプリケーション
- 2つの異なる非同期処理実装パターン
- 非同期処理に関する学習ドキュメント
- ベストプラクティス集

## 学習目標
- Reactでの適切な非同期処理パターンの習得
- DDD + レイヤードアーキテクチャの実践
- RxJSによるリアクティブプログラミングの理解
- エラーハンドリングとキャンセル処理の実装技術
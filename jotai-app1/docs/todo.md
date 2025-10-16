# チケット管理アプリ - 実装進捗チェックリスト

## 全体進捗

- [x] プロジェクト初期設定
- [x] ドキュメント作成
- [x] 依存関係のインストール
- [x] ディレクトリ構造の構築
- [x] ドメイン層の実装
- [ ] アプリケーション層の実装
- [ ] インフラ層の実装
- [ ] プレゼンテーション層の実装
- [ ] アプリケーションの統合
- [ ] 動作確認・テスト

---

## 1. プロジェクト初期設定 ✅

- [x] Vite + React + TypeScript テンプレート作成
- [x] CLAUDE.md 作成

## 2. ドキュメント作成 ✅

- [x] docs/requirement.md - 要件定義書
- [x] docs/architecture.md - アーキテクチャ設計書
- [x] docs/todo.md - 進捗管理チェックリスト（このファイル）

## 3. 依存関係のインストール ✅

- [x] jotai のインストール

## 4. ディレクトリ構造の構築 ✅

```
src/
├── domain/              ✅
│   ├── entities/        ✅
│   ├── value-objects/   ✅
│   └── repositories/    ✅
├── application/         ✅
│   ├── usecases/        ✅
│   └── dto/             ✅
├── infrastructure/      ✅
│   ├── repositories/    ✅
│   ├── services/        ✅
│   └── di/              ✅
└── presentation/        ✅
    ├── components/      ✅
    ├── hooks/           ✅
    ├── state/           ✅
    └── pages/           ✅
```

## 5. ドメイン層の実装 ✅

### バリューオブジェクト
- [x] `TicketStatus.ts` - ステータスEnum、バリデーション、ヘルパー関数
- [x] `TicketId.ts` - チケットID（UUID）の管理

### エンティティ
- [x] `Ticket.ts` - チケットエンティティ
  - [x] ファクトリメソッド（create, reconstruct）
  - [x] ビジネスロジック（updateStatus, updateContent）
  - [x] バリデーション（タイトル、説明）
  - [x] 状態チェックメソッド（isDone, isInProgress, isTodo）

### リポジトリインターフェース
- [x] `ITicketRepository.ts` - リポジトリインターフェース
  - [x] findAll() - 全チケット取得
  - [x] findById() - ID検索
  - [x] save() - 保存
  - [x] delete() - 削除

## 6. アプリケーション層の実装 🚧

### DTO（Data Transfer Object）
- [ ] `TicketDTO.ts` - データ転送オブジェクト

### ユースケース
- [ ] `GetTicketsUseCase.ts` - チケット一覧取得
- [ ] `GetTicketByIdUseCase.ts` - チケット詳細取得
- [ ] `CreateTicketUseCase.ts` - チケット作成
- [ ] `UpdateTicketStatusUseCase.ts` - ステータス更新
- [ ] `UpdateTicketContentUseCase.ts` - 内容更新
- [ ] `DeleteTicketUseCase.ts` - チケット削除

## 7. インフラ層の実装 ⏳

### リポジトリ実装
- [ ] `InMemoryTicketRepository.ts` - インメモリリポジトリ
  - [ ] データストア（Map）
  - [ ] CRUD操作の実装
  - [ ] 初期データの投入

### サービス
- [ ] `PollingService.ts` - ポーリングサービス
  - [ ] start() - ポーリング開始
  - [ ] stop() - ポーリング停止
  - [ ] エラーハンドリング

### DI（Dependency Injection）
- [ ] `DIContainer.ts` - DIコンテナ
  - [ ] シングルトンパターン
  - [ ] リポジトリの注入
  - [ ] ユースケースの注入
  - [ ] Getter メソッド

## 8. プレゼンテーション層の実装 ⏳

### 状態管理（Jotai）
- [ ] `ticketAtoms.ts` - Jotai atoms
  - [ ] ticketsAtom - チケット一覧
  - [ ] isLoadingAtom - ローディング状態
  - [ ] errorAtom - エラー状態
  - [ ] filterAtom - フィルタ状態
  - [ ] filteredTicketsAtom - フィルタ済みチケット（派生atom）

### カスタムフック
- [ ] `useTicketPolling.ts` - ポーリングフック
  - [ ] 5秒間隔のポーリング
  - [ ] マウント時に開始、アンマウント時に停止
  - [ ] エラーハンドリング

- [ ] `useTicketOperations.ts` - チケット操作フック
  - [ ] createTicket() - チケット作成
  - [ ] updateStatus() - ステータス更新
  - [ ] updateContent() - 内容更新
  - [ ] deleteTicket() - チケット削除

### コンポーネント
- [ ] `TicketPage.tsx` - メインページ
- [ ] `TicketList.tsx` - チケット一覧
  - [ ] フィルタリング機能
  - [ ] ポーリングの統合
- [ ] `TicketCard.tsx` - チケットカード
  - [ ] チケット情報の表示
  - [ ] ステータス変更ボタン
  - [ ] 削除ボタン
- [ ] `TicketForm.tsx` - チケット作成フォーム
  - [ ] タイトル入力（バリデーション）
  - [ ] 説明入力（バリデーション）
  - [ ] 送信処理
- [ ] `TicketStatusBadge.tsx` - ステータスバッジ
  - [ ] ステータス別の色分け
  - [ ] ラベル表示
- [ ] `TicketFilter.tsx` - フィルタコンポーネント
  - [ ] ALL / TODO / IN_PROGRESS / DONE
- [ ] `LoadingSpinner.tsx` - ローディング表示
- [ ] `ErrorMessage.tsx` - エラーメッセージ

### スタイリング
- [ ] コンポーネント用のCSSファイル作成
  - [ ] TicketPage.css
  - [ ] TicketList.css
  - [ ] TicketCard.css
  - [ ] TicketForm.css

## 9. アプリケーションの統合 ⏳

- [ ] `main.tsx` の更新
  - [ ] Jotai Provider の追加（必要な場合）
- [ ] `App.tsx` の更新
  - [ ] TicketPage の配置
  - [ ] グローバルスタイルの調整
- [ ] DIコンテナの初期化確認

## 10. 動作確認・テスト ⏳

### 機能テスト
- [ ] チケット作成機能
  - [ ] タイトル・説明の入力
  - [ ] バリデーションエラーの表示
  - [ ] 作成後のリスト更新
- [ ] チケット一覧表示
  - [ ] 全チケットの表示
  - [ ] ステータス別フィルタリング
- [ ] ステータス更新機能
  - [ ] ステータス遷移
  - [ ] 更新日時の反映
- [ ] チケット削除機能
  - [ ] 削除確認
  - [ ] リストからの削除
- [ ] ポーリング機能
  - [ ] 5秒間隔での更新
  - [ ] エラー時の継続
  - [ ] コンポーネントのアンマウント時の停止

### アーキテクチャ確認
- [ ] レイヤー間の依存関係が正しいか
- [ ] DIPが適切に適用されているか
- [ ] DIコンテナが正しく機能しているか

### UI/UX確認
- [ ] レスポンシブデザイン
- [ ] ローディング状態の表示
- [ ] エラーメッセージの表示
- [ ] 操作のフィードバック

## 11. ドキュメント更新 ⏳

- [ ] CLAUDE.md の更新
  - [ ] アーキテクチャ情報の追加
  - [ ] 実装完了後の情報追加
- [ ] README.md の更新
  - [ ] プロジェクト概要
  - [ ] セットアップ手順
  - [ ] 使い方

---

## 進捗状況サマリー

### 完了
- ドキュメント作成（requirement.md, architecture.md, todo.md）
- ディレクトリ構造の構築
- ドメイン層の完全実装

### 進行中
- アプリケーション層のユースケース実装

### 未着手
- インフラ層の実装
- プレゼンテーション層の実装
- 統合・テスト

### 全体進捗率
約 **40%** 完了

---

## 次のステップ

1. ✅ ~~ドメイン層の実装~~
2. 🚧 アプリケーション層のユースケース実装（現在）
3. ⏭️ インフラ層のリポジトリ・DI実装
4. ⏭️ プレゼンテーション層のコンポーネント実装
5. ⏭️ 統合・動作確認

---

## メモ・注意事項

- バリデーションはドメイン層で実施（ビジネスルール）
- UIのバリデーションはプレゼンテーション層で追加可能
- ポーリング間隔は5秒（要件より）
- 初期データは3-5件程度のモックデータを用意
- ステータス遷移はすべて許可（TODO ↔ IN_PROGRESS ↔ DONE）

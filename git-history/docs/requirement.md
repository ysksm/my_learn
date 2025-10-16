# Git履歴データベース化ツール - 要件定義

## プロジェクト概要

Gitリポジトリのコミット履歴を解析し、DuckDBデータベースに保存するRustアプリケーション。
コミット情報とファイル変更履歴を構造化データとして管理し、分析を容易にする。

## 技術スタック

- **言語**: Rust (Edition 2024)
- **Gitライブラリ**: `git2` (libgit2のRustバインディング)
- **データベース**: DuckDB (`duckdb` クレート)
- **CLIパーサー**: `clap` (オプション)

## 機能要件

### 1. Gitリポジトリの解析

#### 1.1 リポジトリの読み込み
- カレントディレクトリまたは指定パスのGitリポジトリを開く
- `.git` ディレクトリの存在確認とバリデーション
- エラーハンドリング（リポジトリが見つからない場合）

#### 1.2 コミット履歴の走査
- 全ブランチのコミット履歴を取得（またはHEADから辿る）
- コミットの時系列順（新しい→古い、または古い→新しい）で処理
- マージコミットの処理（複数の親コミット対応）

### 2. データベーススキーマ

#### テーブル1: `commits`（コミット情報）

| カラム名 | データ型 | 説明 | 制約 |
|---------|---------|------|------|
| commit_hash | VARCHAR | コミットのSHA-1ハッシュ (40文字) | PRIMARY KEY |
| parent_hash | VARCHAR | 親コミットのハッシュ | NULL可（初回コミットの場合） |
| message | TEXT | コミットメッセージ（全文） | NOT NULL |
| author_name | VARCHAR | コミッター名 | NOT NULL |
| author_email | VARCHAR | コミッターメールアドレス | NOT NULL |
| commit_date | TIMESTAMP | コミット日時 | NOT NULL |
| created_at | TIMESTAMP | レコード作成日時 | DEFAULT CURRENT_TIMESTAMP |

**注意事項**:
- マージコミット（複数親）の場合、親ごとに複数レコードを作成するか、最初の親のみを記録するか検討
- コミットメッセージは改行を含む可能性がある

#### テーブル2: `file_changes`（ファイル変更履歴）

| カラム名 | データ型 | 説明 | 制約 |
|---------|---------|------|------|
| id | INTEGER | 自動採番ID | PRIMARY KEY AUTOINCREMENT |
| commit_hash | VARCHAR | コミットハッシュ | FOREIGN KEY → commits(commit_hash) |
| file_path | VARCHAR | ファイルパス（リポジトリルートからの相対パス） | NOT NULL |
| lines_added | INTEGER | 追加行数 | DEFAULT 0 |
| lines_deleted | INTEGER | 削除行数 | DEFAULT 0 |
| total_lines | INTEGER | コミット後の総行数 | NULL可（バイナリファイル等） |
| commit_count | INTEGER | このファイルの累積コミット回数 | DEFAULT 1 |
| change_type | VARCHAR | 変更種別 (ADD/MODIFY/DELETE/RENAME) | NOT NULL |
| created_at | TIMESTAMP | レコード作成日時 | DEFAULT CURRENT_TIMESTAMP |

**注意事項**:
- `commit_count` はそのコミット時点でのファイルの累積変更回数
- ファイル名変更（RENAME）の場合、旧パスと新パスを記録する方法を検討
- バイナリファイルの場合、行数はNULLまたは0とする

### 3. データ取得・集計機能

#### 3.1 コミット履歴の取得
- 各コミットから以下の情報を抽出:
  - コミットハッシュ（SHA-1）
  - 親コミットハッシュ（複数の場合は全て）
  - コミットメッセージ
  - 作成者情報（名前、メールアドレス）
  - コミット日時

#### 3.2 ファイル変更情報の取得
- 各コミットでの差分（diff）を解析:
  - 変更されたファイルのリスト
  - 各ファイルの追加行数・削除行数
  - 変更種別（新規追加/変更/削除/リネーム）

#### 3.3 ファイルのコミット回数の集計
- ファイルごとに変更履歴を追跡
- 累積コミット回数をカウント
- ファイル名変更時の追跡（可能であれば）

### 4. CLI インターフェース

#### 4.1 基本コマンド
```bash
# カレントディレクトリのリポジトリを解析
git-history analyze

# 指定パスのリポジトリを解析
git-history analyze --repo /path/to/repo

# 出力先データベースを指定
git-history analyze --output history.db

# 特定のブランチのみを解析
git-history analyze --branch main

# 既存DBに追加（増分更新）
git-history analyze --incremental
```

#### 4.2 オプション
- `--repo <PATH>`: リポジトリのパス（デフォルト: カレントディレクトリ）
- `--output <DB_PATH>`: 出力DBファイルパス（デフォルト: `git-history.db`）
- `--branch <BRANCH>`: 解析対象ブランチ（デフォルト: 全ブランチ）
- `--incremental`: 増分更新モード（既存DBに追記）
- `--verbose`, `-v`: 詳細ログ出力
- `--limit <N>`: 解析するコミット数の上限

### 5. エクスポート・クエリ機能（オプション）

#### 5.1 基本的なクエリ例
```sql
-- 最も変更回数が多いファイルTOP 10
SELECT file_path, SUM(commit_count) as total_commits
FROM file_changes
GROUP BY file_path
ORDER BY total_commits DESC
LIMIT 10;

-- 特定期間のコミット数
SELECT DATE_TRUNC('month', commit_date) as month, COUNT(*) as commits
FROM commits
GROUP BY month
ORDER BY month;

-- 最も行数を追加した開発者
SELECT author_name, SUM(lines_added) as total_lines
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY author_name
ORDER BY total_lines DESC;
```

## 非機能要件

### 1. パフォーマンス
- 大規模リポジトリ（10,000コミット以上）でも実行可能
- バッチ挿入によるDB書き込み最適化
- 進捗表示（処理中のコミット数/全体）

### 2. エラーハンドリング
- Gitリポジトリが見つからない場合のエラーメッセージ
- 壊れたコミットやバイナリファイルの処理
- データベース接続エラーの処理
- 途中で中断された場合のロールバック

### 3. 拡張性
- 新しいテーブル追加が容易な設計
- 他のVCS（Mercurial, SVN）への対応可能性を考慮
- プラグイン機構（将来的な拡張）

## データフロー

```
1. Gitリポジトリを開く (git2::Repository::open)
   ↓
2. HEADから全コミットを走査 (revwalk)
   ↓
3. 各コミットについて:
   a. コミット情報を抽出 → commits テーブルに挿入
   b. 親コミットとのdiffを取得
   c. 変更ファイルごとに:
      - ファイルパス、行数を抽出
      - 累積コミット回数を計算
      → file_changes テーブルに挿入
   ↓
4. トランザクションをコミット
   ↓
5. 完了メッセージとDB統計を表示
```

## 制約事項

### 1. Git履歴の複雑性
- マージコミットの扱い（複数親の場合、最初の親のみ記録するか、全て記録するか）
- ファイル名変更の追跡（`git log --follow` 相当）
- サブモジュールの扱い（スキップするか、再帰的に解析するか）

### 2. パフォーマンス制限
- 非常に大きなファイル（数万行）のdiff処理
- バイナリファイルは行数カウント不可

### 3. データの正確性
- `commit_count` は初回実行時は累積値を計算できない（各コミットでカウント+1）
- ファイル削除後に再作成された場合の扱い

## 実装優先度

### Phase 1（MVP: 最小限の機能）
- ✅ 基本的なコミット情報の抽出と保存
- ✅ ファイル変更情報の抽出（行数、変更種別）
- ✅ DuckDBへのデータ挿入
- ✅ CLI基本コマンド（`analyze`）

### Phase 2（機能拡張）
- ⬜ ファイルごとのコミット回数の正確な集計
- ⬜ マージコミットの適切な処理
- ⬜ 進捗表示とログ出力
- ⬜ 増分更新モード

### Phase 3（高度な機能）
- ⬜ ファイル名変更の追跡
- ⬜ ブランチごとの分析
- ⬜ クエリ用のビュー作成
- ⬜ エクスポート機能（CSV, JSON）

## 成功基準

1. ✅ 指定されたGitリポジトリの全コミット履歴をDBに保存できる
2. ✅ `commits` テーブルと `file_changes` テーブルが正しく作成される
3. ✅ ファイルの変更行数が正確に記録される
4. ✅ SQLクエリで履歴分析が可能
5. ✅ 1,000コミット規模のリポジトリを1分以内に処理（目安）

## 参考情報

### 使用するクレート
- `git2`: https://docs.rs/git2/
- `duckdb`: https://docs.rs/duckdb/
- `clap`: https://docs.rs/clap/ (CLI引数パース)
- `anyhow`: https://docs.rs/anyhow/ (エラーハンドリング)
- `chrono`: https://docs.rs/chrono/ (日時処理)

### 参考資料
- libgit2 documentation: https://libgit2.org/
- DuckDB SQL reference: https://duckdb.org/docs/

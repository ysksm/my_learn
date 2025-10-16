# git-history ユーザーズマニュアル

## 概要

`git-history`は、Gitリポジトリのコミット履歴を解析し、DuckDBデータベースに保存するコマンドラインツールです。
コミット情報やファイル変更履歴を構造化データとして保存することで、SQLクエリを使った柔軟な分析が可能になります。

## インストール

### 前提条件

- Rust 1.70以上 (Edition 2024をサポートするバージョン)
- Git (コマンドラインツール)

### ビルド方法

```bash
# リポジトリをクローン（または、プロジェクトディレクトリに移動）
cd git-history

# ビルド
cargo build --release

# インストール（オプション）
cargo install --path .
```

ビルドが完了すると、実行ファイルは以下のパスに生成されます：
- `target/release/git-history` (リリースビルド)
- `target/debug/git-history` (デバッグビルド)

## 基本的な使い方

### 1. カレントディレクトリのリポジトリを解析

```bash
# 基本コマンド
cargo run -- analyze

# または、ビルド済みバイナリを使用
./target/release/git-history analyze
```

デフォルトでは：
- リポジトリパス: `.` (カレントディレクトリ)
- 出力DB: `git-history.db`
- 対象ブランチ: HEADから辿れる全コミット

### 2. 指定したリポジトリを解析

```bash
# 相対パス
cargo run -- analyze --repo ../my-project

# 絶対パス
cargo run -- analyze --repo /path/to/repository

# 出力先を指定
cargo run -- analyze --repo ../my-project --output analysis.db
```

### 3. 詳細ログを表示

```bash
cargo run -- analyze --verbose

# 出力例:
# 🔍 Analyzing repository: .
# ✓ Repository opened successfully
# ✓ Database initialized: git-history.db
# ✓ Found 100 commits
#   Processing commits 1-100/100
#     [abc12345] Initial commit
#     [def67890] Add feature X
#     ...
```

### 4. コミット数を制限

```bash
# 最新10コミットのみ解析
cargo run -- analyze --limit 10

# デバッグや動作確認に便利
cargo run -- analyze --limit 5 --verbose
```

## コマンドオプション

### `analyze` サブコマンド

| オプション | 短縮形 | デフォルト値 | 説明 |
|-----------|--------|-------------|------|
| `--repo` | `-r` | `.` | 解析対象のGitリポジトリのパス |
| `--output` | `-o` | `git-history.db` | 出力するDuckDBファイルのパス |
| `--branch` | `-b` | なし | 解析対象のブランチ名（指定しない場合はHEADから辿る） |
| `--incremental` | `-i` | false | 増分更新モード（既存DBに追記） |
| `--verbose` | `-v` | false | 詳細ログを出力 |
| `--limit` | `-l` | なし | 解析するコミット数の上限 |
| `--help` | `-h` | - | ヘルプを表示 |

### 使用例

```bash
# 基本
cargo run -- analyze

# 詳細ログ付き
cargo run -- analyze -v

# 特定のリポジトリとブランチを指定
cargo run -- analyze --repo ~/projects/myapp --branch main

# 出力先を変更
cargo run -- analyze --output ~/analysis/history.db

# コミット数を制限（テスト用）
cargo run -- analyze --limit 20 -v

# 組み合わせ
cargo run -- analyze \
  --repo /path/to/repo \
  --output analysis.db \
  --limit 100 \
  --verbose
```

## データベーススキーマ

### `commits` テーブル

コミット情報を保存します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `commit_hash` | VARCHAR | コミットのSHA-1ハッシュ (PRIMARY KEY) |
| `parent_hash` | VARCHAR | 親コミットのハッシュ (NULL可) |
| `message` | TEXT | コミットメッセージ |
| `author_name` | VARCHAR | コミット作成者名 |
| `author_email` | VARCHAR | コミット作成者のメールアドレス |
| `commit_date` | BIGINT | コミット日時 (Unix timestamp) |
| `created_at` | TIMESTAMP | レコード作成日時 |

### `file_changes` テーブル

ファイル変更情報を保存します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `commit_hash` | VARCHAR | コミットハッシュ (PRIMARY KEY) |
| `file_path` | VARCHAR | ファイルパス (PRIMARY KEY) |
| `lines_added` | INTEGER | 追加された行数 |
| `lines_deleted` | INTEGER | 削除された行数 |
| `total_lines` | INTEGER | コミット後の総行数 (NULL可) |
| `commit_count` | INTEGER | ファイルの累積コミット回数 |
| `change_type` | VARCHAR | 変更種別 (ADD/MODIFY/DELETE/RENAME) |
| `created_at` | TIMESTAMP | レコード作成日時 |

## データベースのクエリ

### DuckDB CLIを使う

```bash
# DuckDBをインストール（Homebrewの場合）
brew install duckdb

# データベースを開く
duckdb git-history.db
```

### クエリ例

#### 1. 基本統計

```sql
-- 総コミット数
SELECT COUNT(*) as total_commits FROM commits;

-- 総ファイル数（ユニーク）
SELECT COUNT(DISTINCT file_path) as total_files FROM file_changes;

-- 変更種別の分布
SELECT change_type, COUNT(*) as count
FROM file_changes
GROUP BY change_type
ORDER BY count DESC;
```

#### 2. コミット履歴の表示

```sql
-- 最新10件のコミット
SELECT
  substr(commit_hash, 1, 8) as hash,
  author_name,
  substr(message, 1, 50) as message,
  from_unixtime(commit_date) as date
FROM commits
ORDER BY commit_date DESC
LIMIT 10;

-- 特定の作成者のコミット数
SELECT
  author_name,
  COUNT(*) as commit_count
FROM commits
GROUP BY author_name
ORDER BY commit_count DESC;
```

#### 3. ファイル変更の分析

```sql
-- 最も変更回数が多いファイル TOP 10
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added) as total_added,
  SUM(lines_deleted) as total_deleted
FROM file_changes
GROUP BY file_path
ORDER BY change_count DESC
LIMIT 10;

-- 大きな変更があったコミット
SELECT
  c.commit_hash,
  c.author_name,
  substr(c.message, 1, 50) as message,
  SUM(fc.lines_added + fc.lines_deleted) as total_changes
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.commit_hash, c.author_name, c.message
ORDER BY total_changes DESC
LIMIT 10;

-- 特定のファイルの変更履歴
SELECT
  c.commit_hash,
  c.author_name,
  fc.lines_added,
  fc.lines_deleted,
  fc.change_type,
  from_unixtime(c.commit_date) as date
FROM file_changes fc
JOIN commits c ON fc.commit_hash = c.commit_hash
WHERE fc.file_path = 'src/main.rs'
ORDER BY c.commit_date DESC;
```

#### 4. 時系列分析

```sql
-- 月別のコミット数
SELECT
  DATE_TRUNC('month', from_unixtime(commit_date)) as month,
  COUNT(*) as commits
FROM commits
GROUP BY month
ORDER BY month;

-- 日別の追加/削除行数
SELECT
  DATE_TRUNC('day', from_unixtime(c.commit_date)) as day,
  SUM(fc.lines_added) as added,
  SUM(fc.lines_deleted) as deleted
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY day
ORDER BY day;
```

#### 5. 作成者別の分析

```sql
-- 作成者別の追加行数ランキング
SELECT
  c.author_name,
  COUNT(DISTINCT c.commit_hash) as commits,
  SUM(fc.lines_added) as total_added,
  SUM(fc.lines_deleted) as total_deleted
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.author_name
ORDER BY total_added DESC;
```

#### 6. ファイルタイプ別の分析

```sql
-- 拡張子別の変更統計
SELECT
  regexp_extract(file_path, '\\.([^.]+)$', 1) as extension,
  COUNT(DISTINCT file_path) as files,
  COUNT(*) as changes,
  SUM(lines_added) as total_added
FROM file_changes
WHERE file_path LIKE '%.%'
GROUP BY extension
ORDER BY changes DESC
LIMIT 10;
```

### CSVエクスポート

```sql
-- CSVファイルにエクスポート
COPY (
  SELECT * FROM commits ORDER BY commit_date DESC
) TO 'commits.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM file_changes
) TO 'file_changes.csv' (HEADER, DELIMITER ',');
```

## パフォーマンスチューニング

### 大規模リポジトリの場合

```bash
# まず少数のコミットでテスト
cargo run -- analyze --limit 100 -v

# 問題なければ全体を解析
cargo run --release -- analyze
```

### バッチサイズの調整

現在のバッチサイズは100コミットです。必要に応じて `src/analyzer.rs` の以下の行を変更できます：

```rust
let batch_size = 100; // この値を変更
```

## トラブルシューティング

### エラー: "Git repository not found"

**原因**: 指定されたパスにGitリポジトリが存在しない

**解決策**:
```bash
# パスを確認
ls -la /path/to/repo/.git

# 正しいパスを指定
cargo run -- analyze --repo /correct/path
```

### エラー: "Database error"

**原因**: データベースファイルが破損している、または古いスキーマを使用している

**解決策**:
```bash
# 既存のDBファイルを削除して再実行
rm git-history.db
cargo run -- analyze
```

### パフォーマンスが遅い

**原因**: 大規模リポジトリや多数のコミット

**解決策**:
```bash
# リリースビルドを使用（最適化あり）
cargo build --release
./target/release/git-history analyze

# または、コミット数を制限
cargo run --release -- analyze --limit 1000
```

### メモリ不足

**原因**: 非常に大規模なリポジトリ

**解決策**:
- バッチサイズを小さくする（コード変更が必要）
- `--limit` オプションで段階的に処理
- システムメモリを増やす

## 高度な使い方

### 1. 複数リポジトリの比較

```bash
# リポジトリAを解析
cargo run -- analyze --repo ~/projectA --output projectA.db

# リポジトリBを解析
cargo run -- analyze --repo ~/projectB --output projectB.db

# DuckDBで両方を結合
duckdb -c "
  ATTACH 'projectA.db' AS projA;
  ATTACH 'projectB.db' AS projB;

  SELECT
    'Project A' as project,
    COUNT(*) as commits
  FROM projA.commits
  UNION ALL
  SELECT
    'Project B' as project,
    COUNT(*) as commits
  FROM projB.commits;
"
```

### 2. 定期的な分析の自動化

```bash
#!/bin/bash
# analyze.sh - 定期実行スクリプト

REPO_PATH="/path/to/repo"
OUTPUT_DB="/path/to/analysis/history-$(date +%Y%m%d).db"

cd /path/to/git-history
cargo run --release -- analyze \
  --repo "$REPO_PATH" \
  --output "$OUTPUT_DB" \
  --verbose

echo "Analysis saved to: $OUTPUT_DB"
```

```bash
# crontabに登録（毎日午前2時に実行）
0 2 * * * /path/to/analyze.sh >> /var/log/git-analysis.log 2>&1
```

### 3. カスタムレポートの生成

```sql
-- report.sql
.mode markdown

SELECT '# Git Repository Analysis Report' as title;
SELECT '' as blank;

SELECT '## Summary' as section;
SELECT
  'Total Commits: ' || COUNT(*) as stat
FROM commits;

SELECT
  'Total Files: ' || COUNT(DISTINCT file_path) as stat
FROM file_changes;

SELECT '' as blank;
SELECT '## Top Contributors' as section;
SELECT
  author_name,
  COUNT(*) as commits
FROM commits
GROUP BY author_name
ORDER BY commits DESC
LIMIT 5;
```

```bash
# レポート生成
duckdb git-history.db < report.sql > report.md
```

## 制限事項

1. **マージコミット**: 最初の親のみを記録
2. **行数計算**: 簡易実装（複数ファイルの場合は均等分配）
3. **バイナリファイル**: 行数は計算されない
4. **ファイル名変更**: 別ファイルとして扱われる（追跡未実装）
5. **サブモジュール**: 解析対象外

## 次のステップ

- [要件定義書](requirement.md) - プロジェクトの詳細な仕様
- [アーキテクチャ設計](architecture.md) - 内部構造の詳細
- [クエリ例集](queries.md) - より多くのクエリサンプル

## サポート

問題が発生した場合は、以下を確認してください：

1. Rustのバージョン（`rustc --version`）
2. Gitのバージョン（`git --version`）
3. エラーメッセージの全文
4. 実行したコマンド

GitHubのIssuesでバグ報告や機能要望を受け付けています。

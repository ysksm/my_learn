# Git履歴データベース化ツール - アーキテクチャ設計

## アーキテクチャ概要

レイヤードアーキテクチャを採用し、関心事の分離と保守性を重視した設計。

```
┌─────────────────────────────────────────┐
│         CLI Layer (main.rs)             │
│  - コマンドライン引数のパース             │
│  - アプリケーション起動                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│      Application Layer (analyzer)       │
│  - 全体のワークフロー制御                 │
│  - Git → DB のオーケストレーション        │
└────┬────────────────────────┬───────────┘
     │                        │
     ▼                        ▼
┌──────────────┐      ┌──────────────────┐
│ Git Module   │      │  Database Module │
│ - Repository │      │  - Schema        │
│ - Commits    │      │  - Insertion     │
│ - Diffs      │      │  - Queries       │
└──────────────┘      └──────────────────┘
     │                        │
     ▼                        ▼
┌──────────────┐      ┌──────────────────┐
│   git2       │      │     duckdb       │
│ (libgit2)    │      │                  │
└──────────────┘      └──────────────────┘
```

## モジュール構成

Rust 2018以降の新しいモジュールシステムを採用（`mod.rs`を使用しない方式）

```
src/
├── main.rs              # エントリーポイント、CLI定義
├── lib.rs               # ライブラリルート
├── analyzer.rs          # メインのワークフロー制御
├── config.rs            # 設定管理
├── error.rs             # カスタムエラー型
├── git.rs               # Gitモジュール定義（新方式）
├── git/
│   ├── repository.rs    # リポジトリ操作
│   └── diff.rs          # Diff解析、ファイル変更情報
├── database.rs          # Databaseモジュール定義（新方式）
└── database/
    ├── models.rs        # データモデル（構造体）
    ├── schema.rs        # スキーマ定義、テーブル作成
    └── repository.rs    # データ挿入、クエリ
```

**新モジュールシステムの特徴**:
- `src/git/mod.rs` → `src/git.rs`（モジュール定義）
- `src/database/mod.rs` → `src/database.rs`（モジュール定義）
- より直感的でディレクトリ構造が明確
- Rust 2018エディション以降の推奨方式

## データフロー

### 1. 初期化フロー

```
main.rs
  → CLI引数をパース (clap)
  → Config 構造体を作成
  → Analyzer::new(config)
  → Database::initialize()
    → CREATE TABLE IF NOT EXISTS commits
    → CREATE TABLE IF NOT EXISTS file_changes
```

### 2. 分析フロー

```
Analyzer::analyze()
  ↓
1. GitRepository::open(repo_path)
  ↓
2. Repository::get_commits()
   → RevWalk で全コミットを取得
   → Vec<Commit> を返す
  ↓
3. for each commit:
   a. extract_commit_info(commit)
      → CommitInfo 構造体を作成
      → parent_hash, message, author, date を抽出

   b. extract_file_changes(commit)
      → commit.tree() と parent.tree() の diff
      → Diff を解析して FileChange のリストを作成
      → lines_added, lines_deleted を計算

   c. calculate_commit_count(file_path)
      → このファイルの累積コミット回数を計算
  ↓
4. Database::insert_commits(Vec<CommitInfo>)
   → バッチ挿入（トランザクション）
  ↓
5. Database::insert_file_changes(Vec<FileChange>)
   → バッチ挿入（トランザクション）
  ↓
6. 完了メッセージ表示
```

## 主要な型定義

### Config（設定）

```rust
pub struct Config {
    /// リポジトリのパス
    pub repo_path: PathBuf,

    /// 出力データベースのパス
    pub output_db: PathBuf,

    /// 解析対象ブランチ（Noneの場合は全ブランチ）
    pub branch: Option<String>,

    /// 増分更新モード
    pub incremental: bool,

    /// 詳細ログ
    pub verbose: bool,

    /// コミット数の上限
    pub limit: Option<usize>,
}
```

### CommitInfo（コミット情報）

```rust
pub struct CommitInfo {
    /// コミットハッシュ (SHA-1)
    pub commit_hash: String,

    /// 親コミットハッシュ（最初の親のみ）
    pub parent_hash: Option<String>,

    /// コミットメッセージ
    pub message: String,

    /// 作成者名
    pub author_name: String,

    /// 作成者メールアドレス
    pub author_email: String,

    /// コミット日時
    pub commit_date: i64,  // Unix timestamp
}
```

### FileChange（ファイル変更情報）

```rust
pub struct FileChange {
    /// コミットハッシュ
    pub commit_hash: String,

    /// ファイルパス
    pub file_path: String,

    /// 追加行数
    pub lines_added: i32,

    /// 削除行数
    pub lines_deleted: i32,

    /// コミット後の総行数（オプション）
    pub total_lines: Option<i32>,

    /// 累積コミット回数
    pub commit_count: i32,

    /// 変更種別
    pub change_type: ChangeType,
}

pub enum ChangeType {
    Add,
    Modify,
    Delete,
    Rename,
}
```

## 主要なコンポーネント

### 1. Git Module

#### GitRepository

```rust
pub struct GitRepository {
    repo: git2::Repository,
}

impl GitRepository {
    /// リポジトリを開く
    pub fn open(path: &Path) -> Result<Self>;

    /// 全コミットを取得（新しい順）
    pub fn get_commits(&self, branch: Option<&str>) -> Result<Vec<git2::Commit>>;

    /// コミット情報を抽出
    pub fn extract_commit_info(&self, commit: &git2::Commit) -> Result<CommitInfo>;

    /// ファイル変更情報を抽出
    pub fn extract_file_changes(&self, commit: &git2::Commit) -> Result<Vec<FileChange>>;
}
```

#### Diff解析

```rust
/// Diffからファイル変更情報を抽出
pub fn analyze_diff(
    diff: &git2::Diff,
    commit_hash: &str,
) -> Result<Vec<FileChange>>;

/// 行数をカウント
fn count_lines(diff_delta: &git2::DiffDelta) -> (i32, i32);

/// 変更種別を判定
fn detect_change_type(status: git2::Delta) -> ChangeType;
```

### 2. Database Module

#### Database

```rust
pub struct Database {
    conn: duckdb::Connection,
}

impl Database {
    /// データベースを初期化
    pub fn new(path: &Path) -> Result<Self>;

    /// テーブルを作成
    pub fn create_tables(&self) -> Result<()>;

    /// コミット情報をバッチ挿入
    pub fn insert_commits(&self, commits: &[CommitInfo]) -> Result<()>;

    /// ファイル変更情報をバッチ挿入
    pub fn insert_file_changes(&self, changes: &[FileChange]) -> Result<()>;

    /// ファイルのコミット回数を取得
    pub fn get_commit_count(&self, file_path: &str) -> Result<i32>;
}
```

#### スキーマ定義

```sql
-- commits テーブル
CREATE TABLE IF NOT EXISTS commits (
    commit_hash VARCHAR PRIMARY KEY,
    parent_hash VARCHAR,
    message TEXT NOT NULL,
    author_name VARCHAR NOT NULL,
    author_email VARCHAR NOT NULL,
    commit_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- file_changes テーブル
CREATE TABLE IF NOT EXISTS file_changes (
    id INTEGER PRIMARY KEY,
    commit_hash VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    lines_added INTEGER DEFAULT 0,
    lines_deleted INTEGER DEFAULT 0,
    total_lines INTEGER,
    commit_count INTEGER DEFAULT 1,
    change_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commit_hash) REFERENCES commits(commit_hash)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_file_path ON file_changes(file_path);
CREATE INDEX IF NOT EXISTS idx_commit_hash ON file_changes(commit_hash);
CREATE INDEX IF NOT EXISTS idx_commit_date ON commits(commit_date);
```

### 3. Analyzer（ワークフロー制御）

```rust
pub struct Analyzer {
    config: Config,
    git_repo: GitRepository,
    database: Database,
}

impl Analyzer {
    /// 新しいAnalyzerを作成
    pub fn new(config: Config) -> Result<Self>;

    /// 分析を実行
    pub fn analyze(&mut self) -> Result<AnalysisResult>;

    /// ファイルごとのコミット回数を計算
    fn calculate_commit_counts(&self, changes: &mut [FileChange]) -> Result<()>;
}

pub struct AnalysisResult {
    pub total_commits: usize,
    pub total_files: usize,
    pub processing_time: Duration,
}
```

## エラーハンドリング

### カスタムエラー型

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum GitHistoryError {
    #[error("Git repository not found: {0}")]
    RepositoryNotFound(String),

    #[error("Git error: {0}")]
    GitError(#[from] git2::Error),

    #[error("Database error: {0}")]
    DatabaseError(#[from] duckdb::Error),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Invalid configuration: {0}")]
    ConfigError(String),
}

pub type Result<T> = std::result::Result<T, GitHistoryError>;
```

## パフォーマンス最適化

### 1. バッチ挿入

```rust
// 悪い例: 1件ずつ挿入
for commit in commits {
    db.insert_commit(&commit)?;  // N回のDB呼び出し
}

// 良い例: バッチ挿入
db.insert_commits(&commits)?;  // 1回のトランザクション
```

### 2. トランザクション

```rust
pub fn insert_commits(&self, commits: &[CommitInfo]) -> Result<()> {
    let tx = self.conn.transaction()?;

    for commit in commits {
        tx.execute(
            "INSERT INTO commits VALUES (?, ?, ?, ?, ?, ?)",
            params![
                &commit.commit_hash,
                &commit.parent_hash,
                &commit.message,
                &commit.author_name,
                &commit.author_email,
                &commit.commit_date,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}
```

### 3. 準備済みステートメント

```rust
let mut stmt = self.conn.prepare(
    "INSERT INTO file_changes
     (commit_hash, file_path, lines_added, lines_deleted, change_type)
     VALUES (?, ?, ?, ?, ?)"
)?;

for change in file_changes {
    stmt.execute(params![
        &change.commit_hash,
        &change.file_path,
        &change.lines_added,
        &change.lines_deleted,
        change.change_type.to_string(),
    ])?;
}
```

## CLIインターフェース

### Clap定義

```rust
use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "git-history")]
#[command(about = "Git repository history analyzer with DuckDB", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Analyze Git repository and store in DuckDB
    Analyze {
        /// Repository path (default: current directory)
        #[arg(short, long, default_value = ".")]
        repo: PathBuf,

        /// Output database path
        #[arg(short, long, default_value = "git-history.db")]
        output: PathBuf,

        /// Target branch (default: all branches)
        #[arg(short, long)]
        branch: Option<String>,

        /// Incremental mode (append to existing DB)
        #[arg(short, long)]
        incremental: bool,

        /// Verbose output
        #[arg(short, long)]
        verbose: bool,

        /// Limit number of commits to analyze
        #[arg(short, long)]
        limit: Option<usize>,
    },
}
```

## テスト戦略

### 1. ユニットテスト

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_change_type() {
        assert_eq!(
            detect_change_type(git2::Delta::Added),
            ChangeType::Add
        );
    }

    #[test]
    fn test_database_schema_creation() {
        let db = Database::new(":memory:").unwrap();
        db.create_tables().unwrap();
        // テーブルが作成されたことを確認
    }
}
```

### 2. 統合テスト

```rust
// tests/integration_test.rs
#[test]
fn test_analyze_small_repository() {
    // テスト用の小さなGitリポジトリを作成
    // 分析を実行
    // データベースの内容を検証
}
```

## ログ出力

```rust
// 進捗表示
println!("Analyzing repository: {}", repo_path.display());
println!("Found {} commits", commits.len());

// 詳細ログ (--verbose)
if config.verbose {
    eprintln!("[DEBUG] Processing commit: {}", commit_hash);
    eprintln!("[DEBUG] Found {} file changes", changes.len());
}

// エラーログ
eprintln!("[ERROR] Failed to read repository: {}", err);
```

## 拡張性のための設計

### 1. トレイトによる抽象化

```rust
pub trait CommitExtractor {
    fn extract(&self, commit: &git2::Commit) -> Result<CommitInfo>;
}

pub trait DiffAnalyzer {
    fn analyze(&self, diff: &git2::Diff) -> Result<Vec<FileChange>>;
}
```

### 2. 設定ファイル対応（将来）

```toml
# git-history.toml
[repository]
path = "."
branch = "main"

[database]
output = "history.db"
incremental = false

[analysis]
skip_binary = true
track_renames = true
```

## まとめ

このアーキテクチャは以下を実現します：

✅ **モジュール性**: Git/Database/CLIが独立して保守可能
✅ **テスタビリティ**: 各コンポーネントが単独でテスト可能
✅ **パフォーマンス**: バッチ挿入とトランザクションで高速化
✅ **エラーハンドリング**: 型安全なエラー処理
✅ **拡張性**: 新機能追加が容易な設計

use std::path::PathBuf;

/// アプリケーション設定
#[derive(Debug, Clone)]
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

impl Config {
    /// 新しいConfigを作成
    pub fn new(repo_path: PathBuf, output_db: PathBuf) -> Self {
        Self {
            repo_path,
            output_db,
            branch: None,
            incremental: false,
            verbose: false,
            limit: None,
        }
    }

    /// ブランチを設定
    pub fn with_branch(mut self, branch: Option<String>) -> Self {
        self.branch = branch;
        self
    }

    /// 増分更新モードを設定
    pub fn with_incremental(mut self, incremental: bool) -> Self {
        self.incremental = incremental;
        self
    }

    /// 詳細ログを設定
    pub fn with_verbose(mut self, verbose: bool) -> Self {
        self.verbose = verbose;
        self
    }

    /// コミット数上限を設定
    pub fn with_limit(mut self, limit: Option<usize>) -> Self {
        self.limit = limit;
        self
    }
}

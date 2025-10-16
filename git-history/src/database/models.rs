/// コミット情報
#[derive(Debug, Clone)]
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

    /// コミット日時 (Unix timestamp)
    pub commit_date: i64,
}

/// ファイル変更情報
#[derive(Debug, Clone)]
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

/// 変更種別
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ChangeType {
    Add,
    Modify,
    Delete,
    Rename,
}

impl ChangeType {
    /// 文字列に変換
    pub fn as_str(&self) -> &'static str {
        match self {
            ChangeType::Add => "ADD",
            ChangeType::Modify => "MODIFY",
            ChangeType::Delete => "DELETE",
            ChangeType::Rename => "RENAME",
        }
    }

    /// git2::Deltaから変換
    pub fn from_git_delta(status: git2::Delta) -> Self {
        match status {
            git2::Delta::Added => ChangeType::Add,
            git2::Delta::Modified => ChangeType::Modify,
            git2::Delta::Deleted => ChangeType::Delete,
            git2::Delta::Renamed => ChangeType::Rename,
            _ => ChangeType::Modify, // その他はModifyとして扱う
        }
    }
}

impl std::fmt::Display for ChangeType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

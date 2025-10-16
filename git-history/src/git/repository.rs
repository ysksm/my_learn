use crate::database::models::CommitInfo;
use crate::error::{GitHistoryError, Result};
use git2::{Oid, Repository};
use std::path::Path;

/// Gitリポジトリ管理
pub struct GitRepository {
    repo: Repository,
}

impl GitRepository {
    /// リポジトリを開く
    pub fn open(path: &Path) -> Result<Self> {
        let repo = Repository::open(path).map_err(|_| {
            GitHistoryError::RepositoryNotFound(path.display().to_string())
        })?;

        Ok(Self { repo })
    }

    /// 全コミットを取得（新しい順）
    pub fn get_commits(&self, branch: Option<&str>, limit: Option<usize>) -> Result<Vec<Oid>> {
        let mut revwalk = self.repo.revwalk()?;

        // ブランチ指定がある場合は、そのブランチから開始
        if let Some(branch_name) = branch {
            let reference = self
                .repo
                .find_branch(branch_name, git2::BranchType::Local)?
                .get()
                .target()
                .ok_or_else(|| {
                    GitHistoryError::AnalysisError(format!("Branch {} not found", branch_name))
                })?;
            revwalk.push(reference)?;
        } else {
            // HEADから全コミットを辿る
            revwalk.push_head()?;
        }

        // 時系列順（新しい→古い）
        revwalk.set_sorting(git2::Sort::TIME)?;

        // コミットを収集
        let mut commits = Vec::new();
        for (i, oid) in revwalk.enumerate() {
            if let Some(max_limit) = limit {
                if i >= max_limit {
                    break;
                }
            }
            commits.push(oid?);
        }

        Ok(commits)
    }

    /// コミット情報を抽出
    pub fn extract_commit_info(&self, oid: Oid) -> Result<CommitInfo> {
        let commit = self.repo.find_commit(oid)?;

        // 親コミット（最初の親のみ）
        let parent_hash = commit.parent_id(0).ok().map(|id| id.to_string());

        // 作成者情報
        let author = commit.author();
        let author_name = author
            .name()
            .unwrap_or("Unknown")
            .to_string();
        let author_email = author
            .email()
            .unwrap_or("unknown@example.com")
            .to_string();

        // コミット日時（Unix timestamp）
        let commit_date = commit.time().seconds();

        // コミットメッセージ
        let message = commit
            .message()
            .unwrap_or("(no message)")
            .to_string();

        Ok(CommitInfo {
            commit_hash: oid.to_string(),
            parent_hash,
            message,
            author_name,
            author_email,
            commit_date,
        })
    }

    /// 内部のRepositoryへの参照を取得
    pub fn inner(&self) -> &Repository {
        &self.repo
    }
}

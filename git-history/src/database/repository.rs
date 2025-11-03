use crate::database::models::{CommitInfo, FileChange};
use crate::error::Result;
use duckdb::{params, Connection};
use std::path::Path;

/// データベース管理
pub struct Database {
    conn: Connection,
}

impl Database {
    /// データベースを開く（または作成）
    pub fn new(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        Ok(Self { conn })
    }

    /// テーブルを作成
    pub fn create_tables(&self) -> Result<()> {
        super::schema::create_tables(&self.conn)
    }

    /// コミット情報をバッチ挿入
    pub fn insert_commits(&mut self, commits: &[CommitInfo]) -> Result<()> {
        if commits.is_empty() {
            return Ok(());
        }

        let tx = self.conn.transaction()?;

        {
            let mut stmt = tx.prepare(
                r#"
                INSERT OR IGNORE INTO commits
                (commit_hash, parent_hash, message, author_name, author_email, commit_date)
                VALUES (?, ?, ?, ?, ?, ?)
                "#,
            )?;

            for commit in commits {
                stmt.execute(params![
                    &commit.commit_hash,
                    &commit.parent_hash,
                    &commit.message,
                    &commit.author_name,
                    &commit.author_email,
                    &commit.commit_date,
                ])?;
            }
        }

        tx.commit()?;
        Ok(())
    }

    /// ファイル変更情報をバッチ挿入
    pub fn insert_file_changes(&mut self, changes: &[FileChange]) -> Result<()> {
        if changes.is_empty() {
            return Ok(());
        }

        let tx = self.conn.transaction()?;

        {
            let mut stmt = tx.prepare(
                r#"
                INSERT OR IGNORE INTO file_changes
                (commit_hash, file_path, lines_added, lines_deleted, total_lines, commit_count, change_type)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                "#,
            )?;

            for change in changes {
                stmt.execute(params![
                    &change.commit_hash,
                    &change.file_path,
                    &change.lines_added,
                    &change.lines_deleted,
                    &change.total_lines,
                    &change.commit_count,
                    change.change_type.as_str(),
                ])?;
            }
        }

        tx.commit()?;
        Ok(())
    }

    /// ファイルのコミット回数を取得
    pub fn get_commit_count(&self, file_path: &str) -> Result<i32> {
        let mut stmt = self
            .conn
            .prepare("SELECT COUNT(*) FROM file_changes WHERE file_path = ?")?;

        let count: i32 = stmt.query_row(params![file_path], |row| row.get(0))?;

        Ok(count)
    }

    /// コミット数を取得
    pub fn get_total_commits(&self) -> Result<usize> {
        let mut stmt = self.conn.prepare("SELECT COUNT(*) FROM commits")?;
        let count: i64 = stmt.query_row([], |row| row.get(0))?;
        Ok(count as usize)
    }

    /// ユニークなファイル数を取得
    pub fn get_total_files(&self) -> Result<usize> {
        let mut stmt = self
            .conn
            .prepare("SELECT COUNT(DISTINCT file_path) FROM file_changes")?;
        let count: i64 = stmt.query_row([], |row| row.get(0))?;
        Ok(count as usize)
    }
}

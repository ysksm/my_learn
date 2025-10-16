use thiserror::Error;

/// カスタムエラー型
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

    #[error("Analysis error: {0}")]
    AnalysisError(String),
}

pub type Result<T> = std::result::Result<T, GitHistoryError>;

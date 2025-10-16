use crate::error::Result;
use duckdb::Connection;

/// テーブルを作成
pub fn create_tables(conn: &Connection) -> Result<()> {
    // commits テーブル
    conn.execute(
        r#"
        CREATE TABLE IF NOT EXISTS commits (
            commit_hash VARCHAR PRIMARY KEY,
            parent_hash VARCHAR,
            message TEXT NOT NULL,
            author_name VARCHAR NOT NULL,
            author_email VARCHAR NOT NULL,
            commit_date BIGINT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        "#,
        [],
    )?;

    // file_changes テーブル
    conn.execute(
        r#"
        CREATE TABLE IF NOT EXISTS file_changes (
            commit_hash VARCHAR NOT NULL,
            file_path VARCHAR NOT NULL,
            lines_added INTEGER DEFAULT 0,
            lines_deleted INTEGER DEFAULT 0,
            total_lines INTEGER,
            commit_count INTEGER DEFAULT 1,
            change_type VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (commit_hash, file_path)
        )
        "#,
        [],
    )?;

    // インデックスを作成
    create_indexes(conn)?;

    Ok(())
}

/// インデックスを作成
fn create_indexes(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_file_path ON file_changes(file_path)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_commit_hash ON file_changes(commit_hash)",
        [],
    )?;

    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_commit_date ON commits(commit_date)",
        [],
    )?;

    Ok(())
}

use crate::database::models::{ChangeType, FileChange};
use crate::error::Result;
use git2::{Diff, Oid, Repository};

/// ファイル変更情報を抽出
pub fn extract_file_changes(
    repo: &Repository,
    commit_oid: Oid,
    commit_hash: &str,
) -> Result<Vec<FileChange>> {
    let commit = repo.find_commit(commit_oid)?;
    let tree = commit.tree()?;

    // 親コミットがある場合は差分を取る
    let diff = if let Ok(parent) = commit.parent(0) {
        let parent_tree = parent.tree()?;
        repo.diff_tree_to_tree(Some(&parent_tree), Some(&tree), None)?
    } else {
        // 初回コミットの場合（親がいない）
        repo.diff_tree_to_tree(None, Some(&tree), None)?
    };

    analyze_diff(&diff, commit_hash)
}

/// Diffを解析してFileChangeのリストを作成
fn analyze_diff(diff: &Diff, commit_hash: &str) -> Result<Vec<FileChange>> {
    let mut changes = Vec::new();

    // まず各ファイルのメタデータを収集
    diff.foreach(
        &mut |delta, _progress| {
            let file_path = delta
                .new_file()
                .path()
                .unwrap_or_else(|| delta.old_file().path().unwrap())
                .to_string_lossy()
                .to_string();

            let change_type = ChangeType::from_git_delta(delta.status());

            changes.push(FileChange {
                commit_hash: commit_hash.to_string(),
                file_path,
                lines_added: 0,
                lines_deleted: 0,
                total_lines: None,
                commit_count: 1,
                change_type,
            });

            true
        },
        None,
        None,
        None,
    )?;

    // 各ファイルごとに正確な行数を計算
    calculate_line_stats_per_file(diff, &mut changes)?;

    Ok(changes)
}

/// 各ファイルごとに行数を正確に計算
fn calculate_line_stats_per_file(diff: &Diff, changes: &mut [FileChange]) -> Result<()> {
    use std::collections::HashMap;

    // ファイルパスごとの行数を集計
    let mut file_stats: HashMap<String, (i32, i32)> = HashMap::new();

    // 行ごとの変更を解析
    diff.print(git2::DiffFormat::Patch, |delta, _hunk, line| {
        let file_path = delta
            .new_file()
            .path()
            .unwrap_or_else(|| delta.old_file().path().unwrap())
            .to_string_lossy()
            .to_string();

        let stats = file_stats.entry(file_path).or_insert((0, 0));

        match line.origin() {
            '+' => stats.0 += 1, // 追加行
            '-' => stats.1 += 1, // 削除行
            _ => {}
        }

        true
    })?;

    // 集計結果をFileChangeに反映
    for change in changes.iter_mut() {
        if let Some(&(added, deleted)) = file_stats.get(&change.file_path) {
            change.lines_added = added;
            change.lines_deleted = deleted;
        }
    }

    Ok(())
}

/// ファイルのコミット回数を計算するヘルパー
pub fn update_commit_counts(
    changes: &mut [FileChange],
    get_count_fn: impl Fn(&str) -> Result<i32>,
) -> Result<()> {
    for change in changes.iter_mut() {
        let existing_count = get_count_fn(&change.file_path)?;
        change.commit_count = existing_count + 1;
    }
    Ok(())
}

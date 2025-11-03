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
    use std::collections::HashMap;

    // ファイルパスごとのデータを一度に収集
    #[derive(Default)]
    struct FileData {
        change_type: Option<ChangeType>,
        lines_added: i32,
        lines_deleted: i32,
    }

    let mut file_map: HashMap<String, FileData> = HashMap::new();

    // diff.printで全ての情報を一度に収集
    diff.print(git2::DiffFormat::Patch, |delta, _hunk, line| {
        let file_path = delta
            .new_file()
            .path()
            .unwrap_or_else(|| delta.old_file().path().unwrap())
            .to_string_lossy()
            .to_string();

        let data = file_map.entry(file_path).or_default();

        // 変更タイプを設定（最初の1回だけ）
        if data.change_type.is_none() {
            data.change_type = Some(ChangeType::from_git_delta(delta.status()));
        }

        // 行数をカウント
        match line.origin() {
            '+' => data.lines_added += 1,
            '-' => data.lines_deleted += 1,
            _ => {}
        }

        true
    })?;

    // HashMapからVecに変換
    let changes: Vec<FileChange> = file_map
        .into_iter()
        .map(|(file_path, data)| FileChange {
            commit_hash: commit_hash.to_string(),
            file_path,
            lines_added: data.lines_added,
            lines_deleted: data.lines_deleted,
            total_lines: None,
            commit_count: 1,
            change_type: data.change_type.unwrap_or(ChangeType::Modify),
        })
        .collect();

    Ok(changes)
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

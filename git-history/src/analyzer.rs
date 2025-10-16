use crate::config::Config;
use crate::database::Database;
use crate::error::Result;
use crate::git::{diff, GitRepository};
use std::time::{Duration, Instant};

/// 分析結果
#[derive(Debug)]
pub struct AnalysisResult {
    pub total_commits: usize,
    pub total_files: usize,
    pub processing_time: Duration,
}

/// アナライザー（メインのワークフロー制御）
pub struct Analyzer {
    config: Config,
}

impl Analyzer {
    /// 新しいAnalyzerを作成
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    /// 分析を実行
    pub fn analyze(&self) -> Result<AnalysisResult> {
        let start_time = Instant::now();

        println!("🔍 Analyzing repository: {}", self.config.repo_path.display());

        // Gitリポジトリを開く
        let git_repo = GitRepository::open(&self.config.repo_path)?;
        println!("✓ Repository opened successfully");

        // データベースを初期化
        let mut database = Database::new(&self.config.output_db)?;
        database.create_tables()?;
        println!("✓ Database initialized: {}", self.config.output_db.display());

        // コミット一覧を取得
        let commit_oids = git_repo.get_commits(
            self.config.branch.as_deref(),
            self.config.limit,
        )?;
        println!("✓ Found {} commits", commit_oids.len());

        // コミットを処理
        let batch_size = 100;
        let total = commit_oids.len();

        for (batch_idx, chunk) in commit_oids.chunks(batch_size).enumerate() {
            let start = batch_idx * batch_size;
            let end = (start + chunk.len()).min(total);

            if self.config.verbose {
                println!("  Processing commits {}-{}/{}", start + 1, end, total);
            } else {
                print!("\r  Processing: {}/{} commits", end, total);
            }

            self.process_commit_batch(&git_repo, &mut database, chunk)?;
        }

        println!("\n✓ All commits processed");

        // 統計情報を取得
        let total_commits = database.get_total_commits()?;
        let total_files = database.get_total_files()?;

        let processing_time = start_time.elapsed();

        println!("\n📊 Analysis complete!");
        println!("  Total commits: {}", total_commits);
        println!("  Total files: {}", total_files);
        println!("  Processing time: {:.2}s", processing_time.as_secs_f64());
        println!("  Database: {}", self.config.output_db.display());

        Ok(AnalysisResult {
            total_commits,
            total_files,
            processing_time,
        })
    }

    /// コミットバッチを処理
    fn process_commit_batch(
        &self,
        git_repo: &GitRepository,
        database: &mut Database,
        commit_oids: &[git2::Oid],
    ) -> Result<()> {
        // コミット情報を抽出
        let mut commit_infos = Vec::new();
        let mut all_file_changes = Vec::new();

        for oid in commit_oids {
            // コミット情報を抽出
            let commit_info = git_repo.extract_commit_info(*oid)?;

            if self.config.verbose {
                println!(
                    "    [{}] {}",
                    &commit_info.commit_hash[..8],
                    commit_info.message.lines().next().unwrap_or("")
                );
            }

            commit_infos.push(commit_info.clone());

            // ファイル変更情報を抽出
            let mut file_changes = diff::extract_file_changes(
                git_repo.inner(),
                *oid,
                &commit_info.commit_hash,
            )?;

            // コミット回数を更新
            diff::update_commit_counts(&mut file_changes, |file_path| {
                database.get_commit_count(file_path)
            })?;

            all_file_changes.extend(file_changes);
        }

        // データベースに挿入
        database.insert_commits(&commit_infos)?;
        database.insert_file_changes(&all_file_changes)?;

        Ok(())
    }
}

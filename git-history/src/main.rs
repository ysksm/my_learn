use clap::{Parser, Subcommand};
use git_history::{Analyzer, Config};
use std::path::PathBuf;
use std::process;

#[derive(Parser, Debug)]
#[command(name = "git-history")]
#[command(version = "0.1.0")]
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

        /// Target branch (default: all branches from HEAD)
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

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Commands::Analyze {
            repo,
            output,
            branch,
            incremental,
            verbose,
            limit,
        } => {
            // 設定を作成
            let config = Config::new(repo, output)
                .with_branch(branch)
                .with_incremental(incremental)
                .with_verbose(verbose)
                .with_limit(limit);

            // アナライザーを作成して実行
            let analyzer = Analyzer::new(config);
            analyzer.analyze()
        }
    };

    match result {
        Ok(analysis_result) => {
            println!("\n✨ Success!");
            if analysis_result.total_commits == 0 {
                println!("⚠️  No commits found in the repository.");
            }
            process::exit(0);
        }
        Err(e) => {
            eprintln!("\n❌ Error: {}", e);
            process::exit(1);
        }
    }
}

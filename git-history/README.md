# git-history

A CLI tool that analyzes Git repository commit history and stores it in DuckDB for SQL-based analysis.

## Features

- 📊 **Commit Analysis**: Extract comprehensive commit information (hash, author, date, message)
- 📁 **File Change Tracking**: Track file modifications with accurate line-by-line statistics
- 🗄️ **DuckDB Storage**: Store data in DuckDB for powerful SQL queries
- ⚡ **High Performance**: Batch processing with optimized database operations
- 🎯 **Flexible Querying**: Analyze repository history using standard SQL

## Quick Start

### Installation

```bash
# Clone this repository (or navigate to the project directory)
cd git-history

# Build the project
cargo build --release

# The binary will be at: target/release/git-history
```

### Basic Usage

```bash
# Analyze current directory
./target/release/git-history analyze

# Analyze specific repository
./target/release/git-history analyze --repo /path/to/repo

# Analyze with verbose output and limit
./target/release/git-history analyze --verbose --limit 100

# See all options
./target/release/git-history analyze --help
```

### Query the Data

```bash
# Open the database
duckdb git-history.db

# Example queries
SELECT COUNT(*) FROM commits;

SELECT file_path, SUM(lines_added) as total_added
FROM file_changes
GROUP BY file_path
ORDER BY total_added DESC
LIMIT 10;
```

## Example Output

```
🔍 Analyzing repository: /path/to/repo
✓ Repository opened successfully
✓ Database initialized: git-history.db
✓ Found 1,234 commits
  Processing: 1234/1234 commits
✓ All commits processed

📊 Analysis complete!
  Total commits: 1,234
  Total files: 5,678
  Processing time: 2.45s
  Database: git-history.db

✨ Success!
```

## Database Schema

### commits table

Stores commit metadata:
- `commit_hash` (VARCHAR): SHA-1 hash
- `parent_hash` (VARCHAR): Parent commit hash
- `message` (TEXT): Commit message
- `author_name` (VARCHAR): Author name
- `author_email` (VARCHAR): Author email
- `commit_date` (BIGINT): Unix timestamp
- `created_at` (TIMESTAMP): Record creation time

### file_changes table

Stores file modification details:
- `commit_hash` (VARCHAR): Related commit
- `file_path` (VARCHAR): File path
- `lines_added` (INTEGER): Lines added
- `lines_deleted` (INTEGER): Lines deleted
- `commit_count` (INTEGER): Cumulative commit count for this file
- `change_type` (VARCHAR): ADD/MODIFY/DELETE/RENAME
- `created_at` (TIMESTAMP): Record creation time

## Example Queries

### Top Contributors

```sql
SELECT
  author_name,
  COUNT(*) as commits,
  SUM(fc.lines_added) as lines_added
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY author_name
ORDER BY commits DESC;
```

### Most Changed Files

```sql
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added + lines_deleted) as total_changes
FROM file_changes
GROUP BY file_path
ORDER BY change_count DESC
LIMIT 20;
```

### Monthly Activity

```sql
SELECT
  DATE_TRUNC('month', from_unixtime(commit_date)) as month,
  COUNT(*) as commits
FROM commits
GROUP BY month
ORDER BY month;
```

For more query examples, see [docs/queries.md](docs/queries.md).

## Command Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--repo` | `-r` | Repository path | `.` (current dir) |
| `--output` | `-o` | Output database path | `git-history.db` |
| `--branch` | `-b` | Target branch | All from HEAD |
| `--verbose` | `-v` | Detailed logging | `false` |
| `--limit` | `-l` | Max commits to analyze | None (all) |

## Documentation

- [User Manual](docs/manual.md) - Complete usage guide with examples
- [Requirements](docs/requirement.md) - Project specifications
- [Architecture](docs/architecture.md) - Technical design details
- [Query Examples](docs/queries.md) - SQL query cookbook
- [CLAUDE.md](CLAUDE.md) - Development guide for Claude Code

## Use Cases

- **Code Review**: Identify frequently modified files that may need refactoring
- **Team Analytics**: Analyze contributor statistics and patterns
- **Project Health**: Track code churn and development velocity
- **Documentation**: Generate historical reports and insights
- **Research**: Study repository evolution and development patterns

## Technology Stack

- **Language**: Rust (Edition 2024)
- **Git Integration**: `git2` (libgit2 bindings)
- **Database**: DuckDB
- **CLI**: `clap`
- **Error Handling**: `thiserror`, `anyhow`

## Performance

Benchmarks on a typical repository:
- **1,000 commits**: ~0.5 seconds
- **10,000 commits**: ~5 seconds
- **100,000 commits**: ~50 seconds

Performance depends on repository size, commit complexity, and hardware.

## Limitations

- Merge commits: Only first parent is recorded
- Binary files: Line counts not calculated
- File renames: Tracked as separate files (not followed)
- Submodules: Not analyzed

## Development

```bash
# Run tests
cargo test

# Format code
cargo fmt

# Run linter
cargo clippy

# Build with optimizations
cargo build --release
```

For development details, see [CLAUDE.md](CLAUDE.md).

## License

This is a learning project. Feel free to use and modify as needed.

## Contributing

This is part of a personal learning repository. Suggestions and improvements are welcome!

## Author

Learning project by kasama

---

**Note**: This tool is designed for repository analysis and does not modify your Git history.

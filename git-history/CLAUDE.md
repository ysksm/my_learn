# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`git-history` is a CLI tool that analyzes Git repository commit history and stores it in DuckDB for SQL-based analysis.
Built with Rust, it extracts commit information and file change statistics, enabling flexible data analysis.

## Development Commands

```bash
# Build the project
cargo build

# Build with optimizations (release mode)
cargo build --release

# Run the application
cargo run -- analyze --help

# Run tests
cargo test

# Check code without building
cargo check

# Format code
cargo fmt

# Run linter
cargo clippy

# Analyze a repository
cargo run -- analyze --repo /path/to/repo

# Analyze with verbose output
cargo run -- analyze --verbose --limit 10

# Clean generated databases
rm -f *.db
```

## Application Usage

```bash
# Analyze current directory
./target/release/git-history analyze

# Analyze specific repository with options
./target/release/git-history analyze \
  --repo /path/to/repo \
  --output analysis.db \
  --verbose \
  --limit 100

# Query the database
duckdb git-history.db
```

## Project Structure

```
git-history/
├── Cargo.toml              # Package manifest and dependencies
├── src/
│   ├── main.rs             # CLI entry point
│   ├── lib.rs              # Library root
│   ├── config.rs           # Configuration management
│   ├── error.rs            # Error types
│   ├── analyzer.rs         # Main workflow orchestration
│   ├── git.rs              # Git module definition (new style)
│   ├── git/                # Git repository interaction
│   │   ├── repository.rs   # Repository operations
│   │   └── diff.rs         # Diff analysis
│   ├── database.rs         # Database module definition (new style)
│   └── database/           # Database operations
│       ├── models.rs       # Data models
│       ├── schema.rs       # Table definitions
│       └── repository.rs   # DB operations
└── docs/
    ├── requirement.md      # Requirements specification
    ├── architecture.md     # Architecture design
    ├── manual.md           # User manual
    └── queries.md          # SQL query examples
```

## Architecture

### Layered Architecture

```
CLI Layer (main.rs)
    ↓
Application Layer (analyzer.rs)
    ↓
   ├─→ Git Module (repository.rs, diff.rs)
   └─→ Database Module (schema.rs, repository.rs)
```

### Key Components

1. **Git Module**: Extracts commit info and file changes using libgit2
2. **Database Module**: Manages DuckDB schema and data insertion
3. **Analyzer**: Orchestrates the analysis workflow with batch processing

### Data Flow

```
1. Open Git repository
2. Walk commits from HEAD
3. For each commit:
   - Extract commit info → commits table
   - Extract file changes → file_changes table
4. Batch insert (100 commits per transaction)
5. Display statistics
```

## Database Schema

### commits table

```sql
CREATE TABLE commits (
    commit_hash VARCHAR PRIMARY KEY,
    parent_hash VARCHAR,
    message TEXT NOT NULL,
    author_name VARCHAR NOT NULL,
    author_email VARCHAR NOT NULL,
    commit_date BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### file_changes table

```sql
CREATE TABLE file_changes (
    commit_hash VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    lines_added INTEGER DEFAULT 0,
    lines_deleted INTEGER DEFAULT 0,
    total_lines INTEGER,
    commit_count INTEGER DEFAULT 1,
    change_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commit_hash, file_path)
);
```

## Dependencies

Key external crates:
- `git2`: libgit2 Rust bindings for Git operations
- `duckdb`: DuckDB database client
- `clap`: CLI argument parsing
- `thiserror`: Error handling
- `chrono`: Date/time utilities

## Testing

```bash
# Run all tests
cargo test

# Test with a small repository
cargo run -- analyze --repo . --limit 5 --verbose

# Verify database contents
duckdb git-history.db -c "SELECT COUNT(*) FROM commits"
```

## Common Development Tasks

### Adding a New Field to commits Table

1. Update `database/schema.rs` - add column to CREATE TABLE
2. Update `database/models.rs` - add field to `CommitInfo` struct
3. Update `git/repository.rs` - extract new field in `extract_commit_info()`
4. Update `database/repository.rs` - add parameter to INSERT statement

### Adding a New Query Feature

1. Add new method to `database/repository.rs`
2. Expose through `Database` struct
3. Use in `analyzer.rs` or add new CLI command
4. Add example to `docs/queries.md`

### Improving Performance

- Adjust batch size in `analyzer.rs` (currently 100 commits)
- Use prepared statements in `database/repository.rs`
- Add indexes in `database/schema.rs`

## Known Limitations

1. **Merge commits**: Only first parent is recorded
2. **Line counting**: Simplified implementation (averaged across files)
3. **Binary files**: Line counts not calculated
4. **File renames**: Tracked as separate files (not followed)
5. **Submodules**: Not analyzed

## Documentation

- [User Manual](docs/manual.md) - Complete usage guide
- [Requirements](docs/requirement.md) - Project specifications
- [Architecture](docs/architecture.md) - Detailed design
- [Query Examples](docs/queries.md) - SQL query cookbook

## Notes

- This is part of a larger learning repository (`my_learn`)
- Edition 2024 is specified (requires recent Rust toolchain)
- Default batch size is 100 commits for optimal performance
- Database files (*.db) are git-ignored

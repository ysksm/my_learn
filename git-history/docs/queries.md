# SQLクエリ例集

DuckDBで使える便利なクエリ集です。`git-history.db` を解析した後に利用できます。

## DuckDBの起動

```bash
duckdb git-history.db
```

## 基本的なクエリ

### データの概要を確認

```sql
-- テーブル一覧
.tables

-- テーブル構造を確認
DESCRIBE commits;
DESCRIBE file_changes;

-- 各テーブルのレコード数
SELECT COUNT(*) FROM commits;
SELECT COUNT(*) FROM file_changes;
```

## コミット分析

### コミット履歴の表示

```sql
-- 最新10件のコミット（見やすい形式）
SELECT
  substr(commit_hash, 1, 8) as hash,
  author_name,
  substr(message, 1, 60) as message,
  strftime(from_unixtime(commit_date), '%Y-%m-%d %H:%M') as date
FROM commits
ORDER BY commit_date DESC
LIMIT 10;
```

### コミット統計

```sql
-- 作成者別のコミット数ランキング
SELECT
  author_name,
  COUNT(*) as commit_count,
  MIN(from_unixtime(commit_date)) as first_commit,
  MAX(from_unixtime(commit_date)) as last_commit
FROM commits
GROUP BY author_name
ORDER BY commit_count DESC;

-- 月別のコミット数推移
SELECT
  strftime(from_unixtime(commit_date), '%Y-%m') as month,
  COUNT(*) as commits
FROM commits
GROUP BY month
ORDER BY month;

-- 曜日別のコミット数
SELECT
  strftime(from_unixtime(commit_date), '%w') as day_of_week,
  CASE strftime(from_unixtime(commit_date), '%w')
    WHEN '0' THEN '日曜日'
    WHEN '1' THEN '月曜日'
    WHEN '2' THEN '火曜日'
    WHEN '3' THEN '水曜日'
    WHEN '4' THEN '木曜日'
    WHEN '5' THEN '金曜日'
    WHEN '6' THEN '土曜日'
  END as day_name,
  COUNT(*) as commits
FROM commits
GROUP BY day_of_week, day_name
ORDER BY day_of_week;

-- 時間帯別のコミット数
SELECT
  strftime(from_unixtime(commit_date), '%H') as hour,
  COUNT(*) as commits
FROM commits
GROUP BY hour
ORDER BY hour;
```

### コミットメッセージの分析

```sql
-- 長いコミットメッセージ TOP 10
SELECT
  substr(commit_hash, 1, 8) as hash,
  author_name,
  LENGTH(message) as msg_length,
  substr(message, 1, 80) as message
FROM commits
ORDER BY msg_length DESC
LIMIT 10;

-- 特定のキーワードを含むコミット
SELECT
  substr(commit_hash, 1, 8) as hash,
  author_name,
  substr(message, 1, 60) as message,
  from_unixtime(commit_date) as date
FROM commits
WHERE message LIKE '%fix%' OR message LIKE '%bug%'
ORDER BY commit_date DESC
LIMIT 20;

-- コミットメッセージの単語頻度（簡易版）
SELECT
  LOWER(regexp_extract(message, '^\w+', 0)) as first_word,
  COUNT(*) as count
FROM commits
WHERE first_word IS NOT NULL AND first_word != ''
GROUP BY first_word
ORDER BY count DESC
LIMIT 20;
```

## ファイル変更分析

### 頻繁に変更されるファイル

```sql
-- 変更回数が多いファイル TOP 20
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added) as total_added,
  SUM(lines_deleted) as total_deleted,
  SUM(lines_added + lines_deleted) as total_changes
FROM file_changes
GROUP BY file_path
ORDER BY change_count DESC
LIMIT 20;

-- 追加行数が多いファイル TOP 20
SELECT
  file_path,
  SUM(lines_added) as total_added,
  COUNT(*) as change_count
FROM file_changes
GROUP BY file_path
ORDER BY total_added DESC
LIMIT 20;

-- 削除行数が多いファイル TOP 20
SELECT
  file_path,
  SUM(lines_deleted) as total_deleted,
  COUNT(*) as change_count
FROM file_changes
GROUP BY file_path
ORDER BY total_deleted DESC
LIMIT 20;
```

### ファイルタイプ別の統計

```sql
-- 拡張子別の変更統計
SELECT
  CASE
    WHEN file_path LIKE '%.%'
    THEN regexp_extract(file_path, '\\.([^.]+)$', 1)
    ELSE '(no extension)'
  END as extension,
  COUNT(DISTINCT file_path) as unique_files,
  COUNT(*) as total_changes,
  SUM(lines_added) as total_added,
  SUM(lines_deleted) as total_deleted
FROM file_changes
GROUP BY extension
ORDER BY total_changes DESC
LIMIT 20;

-- 特定の拡張子のファイル一覧
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added + lines_deleted) as total_changes
FROM file_changes
WHERE file_path LIKE '%.rs'  -- Rustファイル
GROUP BY file_path
ORDER BY change_count DESC;
```

### ディレクトリ別の統計

```sql
-- トップレベルディレクトリ別の変更統計
SELECT
  regexp_extract(file_path, '^([^/]+)', 1) as directory,
  COUNT(DISTINCT file_path) as files,
  COUNT(*) as changes,
  SUM(lines_added) as added,
  SUM(lines_deleted) as deleted
FROM file_changes
WHERE directory IS NOT NULL AND directory != ''
GROUP BY directory
ORDER BY changes DESC;

-- 特定ディレクトリ内のファイル
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added + lines_deleted) as total_changes
FROM file_changes
WHERE file_path LIKE 'src/%'
GROUP BY file_path
ORDER BY change_count DESC
LIMIT 20;
```

### 変更種別の分析

```sql
-- 変更種別の分布
SELECT
  change_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM file_changes
GROUP BY change_type
ORDER BY count DESC;

-- 新規追加されたファイル一覧
SELECT
  file_path,
  c.author_name,
  from_unixtime(c.commit_date) as created_at
FROM file_changes fc
JOIN commits c ON fc.commit_hash = c.commit_hash
WHERE fc.change_type = 'ADD'
ORDER BY c.commit_date DESC
LIMIT 50;

-- 削除されたファイル一覧
SELECT
  file_path,
  c.author_name,
  from_unixtime(c.commit_date) as deleted_at
FROM file_changes fc
JOIN commits c ON fc.commit_hash = c.commit_hash
WHERE fc.change_type = 'DELETE'
ORDER BY c.commit_date DESC;
```

## 結合クエリ（commits + file_changes）

### 大きな変更があったコミット

```sql
-- 変更行数が多いコミット TOP 10
SELECT
  substr(c.commit_hash, 1, 8) as hash,
  c.author_name,
  substr(c.message, 1, 50) as message,
  COUNT(DISTINCT fc.file_path) as files_changed,
  SUM(fc.lines_added) as added,
  SUM(fc.lines_deleted) as deleted,
  SUM(fc.lines_added + fc.lines_deleted) as total_changes
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.commit_hash, c.author_name, c.message
ORDER BY total_changes DESC
LIMIT 10;

-- ファイル数が多いコミット
SELECT
  substr(c.commit_hash, 1, 8) as hash,
  c.author_name,
  substr(c.message, 1, 50) as message,
  COUNT(DISTINCT fc.file_path) as files_changed
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.commit_hash, c.author_name, c.message
ORDER BY files_changed DESC
LIMIT 10;
```

### 特定ファイルの変更履歴

```sql
-- 特定ファイルの全変更履歴
SELECT
  substr(c.commit_hash, 1, 8) as hash,
  c.author_name,
  fc.change_type,
  fc.lines_added,
  fc.lines_deleted,
  from_unixtime(c.commit_date) as date,
  substr(c.message, 1, 60) as message
FROM file_changes fc
JOIN commits c ON fc.commit_hash = c.commit_hash
WHERE fc.file_path = 'src/main.rs'
ORDER BY c.commit_date DESC;

-- 特定ファイルの変更回数と作成者
SELECT
  fc.file_path,
  c.author_name,
  COUNT(*) as change_count,
  SUM(fc.lines_added) as added,
  SUM(fc.lines_deleted) as deleted
FROM file_changes fc
JOIN commits c ON fc.commit_hash = c.commit_hash
WHERE fc.file_path = 'src/main.rs'
GROUP BY fc.file_path, c.author_name
ORDER BY change_count DESC;
```

### 作成者別の貢献度

```sql
-- 作成者別の詳細統計
SELECT
  c.author_name,
  COUNT(DISTINCT c.commit_hash) as commits,
  COUNT(DISTINCT fc.file_path) as files_touched,
  SUM(fc.lines_added) as total_added,
  SUM(fc.lines_deleted) as total_deleted,
  SUM(fc.lines_added + fc.lines_deleted) as total_changes,
  ROUND(AVG(fc.lines_added + fc.lines_deleted), 2) as avg_changes_per_commit
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.author_name
ORDER BY total_changes DESC;

-- 作成者とファイルタイプ別の統計
SELECT
  c.author_name,
  regexp_extract(fc.file_path, '\\.([^.]+)$', 1) as extension,
  COUNT(*) as changes,
  SUM(fc.lines_added) as added
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
WHERE extension IS NOT NULL
GROUP BY c.author_name, extension
ORDER BY c.author_name, changes DESC;
```

## 時系列分析

### 活動の推移

```sql
-- 週別の開発活動
SELECT
  DATE_TRUNC('week', from_unixtime(c.commit_date)) as week,
  COUNT(DISTINCT c.commit_hash) as commits,
  COUNT(DISTINCT fc.file_path) as files_changed,
  SUM(fc.lines_added) as added,
  SUM(fc.lines_deleted) as deleted
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY week
ORDER BY week;

-- 月別の貢献者数
SELECT
  strftime(from_unixtime(commit_date), '%Y-%m') as month,
  COUNT(DISTINCT author_name) as contributors,
  COUNT(*) as commits
FROM commits
GROUP BY month
ORDER BY month;
```

### 特定期間の分析

```sql
-- 最近30日のコミット
SELECT
  substr(commit_hash, 1, 8) as hash,
  author_name,
  substr(message, 1, 60) as message,
  from_unixtime(commit_date) as date
FROM commits
WHERE commit_date >= unixepoch(CURRENT_TIMESTAMP - INTERVAL 30 DAY)
ORDER BY commit_date DESC;

-- 特定期間の統計
SELECT
  COUNT(*) as commits,
  COUNT(DISTINCT author_name) as contributors
FROM commits
WHERE commit_date BETWEEN
  unixepoch('2024-01-01') AND unixepoch('2024-12-31');
```

## 高度なクエリ

### ホットスポット分析（頻繁に変更される問題のあるファイル）

```sql
-- 変更頻度と行数変更のバランス
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added + lines_deleted) as total_changes,
  ROUND(SUM(lines_added + lines_deleted) * 1.0 / COUNT(*), 2) as avg_changes_per_commit,
  -- 変更頻度が高く、平均変更行数も多いファイルは要注意
  CASE
    WHEN COUNT(*) > 5 AND SUM(lines_added + lines_deleted) / COUNT(*) > 50
    THEN '⚠️ ホットスポット'
    ELSE 'OK'
  END as status
FROM file_changes
GROUP BY file_path
HAVING change_count > 3
ORDER BY change_count DESC, avg_changes_per_commit DESC
LIMIT 20;
```

### コミットのインパクト評価

```sql
-- 各コミットのインパクトスコア（ファイル数 × 変更行数）
SELECT
  substr(c.commit_hash, 1, 8) as hash,
  c.author_name,
  substr(c.message, 1, 50) as message,
  COUNT(DISTINCT fc.file_path) as files,
  SUM(fc.lines_added + fc.lines_deleted) as changes,
  COUNT(DISTINCT fc.file_path) * SUM(fc.lines_added + fc.lines_deleted) as impact_score
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.commit_hash, c.author_name, c.message
ORDER BY impact_score DESC
LIMIT 20;
```

### ファイルの寿命分析

```sql
-- ファイルの初回作成から最終変更までの期間
WITH file_timeline AS (
  SELECT
    fc.file_path,
    MIN(c.commit_date) as first_change,
    MAX(c.commit_date) as last_change,
    COUNT(*) as change_count
  FROM file_changes fc
  JOIN commits c ON fc.commit_hash = c.commit_hash
  GROUP BY fc.file_path
)
SELECT
  file_path,
  from_unixtime(first_change) as created,
  from_unixtime(last_change) as last_modified,
  ROUND((last_change - first_change) / 86400.0, 1) as days_active,
  change_count
FROM file_timeline
WHERE change_count > 1
ORDER BY days_active DESC
LIMIT 20;
```

### 共同作業の分析

```sql
-- 同じファイルを変更した作成者のペア
SELECT
  fc1.file_path,
  c1.author_name as author1,
  c2.author_name as author2,
  COUNT(*) as collaboration_count
FROM file_changes fc1
JOIN commits c1 ON fc1.commit_hash = c1.commit_hash
JOIN file_changes fc2 ON fc1.file_path = fc2.file_path
JOIN commits c2 ON fc2.commit_hash = c2.commit_hash
WHERE c1.author_name < c2.author_name  -- 重複を避ける
GROUP BY fc1.file_path, c1.author_name, c2.author_name
HAVING collaboration_count > 1
ORDER BY collaboration_count DESC
LIMIT 20;
```

## エクスポート

### CSV形式でエクスポート

```sql
-- コミット一覧をCSVに
COPY (
  SELECT
    commit_hash,
    parent_hash,
    author_name,
    author_email,
    from_unixtime(commit_date) as commit_date,
    message
  FROM commits
  ORDER BY commit_date DESC
) TO 'commits_export.csv' (HEADER, DELIMITER ',');

-- ファイル変更統計をCSVに
COPY (
  SELECT
    file_path,
    COUNT(*) as change_count,
    SUM(lines_added) as total_added,
    SUM(lines_deleted) as total_deleted
  FROM file_changes
  GROUP BY file_path
  ORDER BY change_count DESC
) TO 'file_stats.csv' (HEADER, DELIMITER ',');
```

### Markdown形式のレポート生成

```sql
.mode markdown

SELECT '# Git Repository Analysis Report' as report;
SELECT '' as blank;
SELECT '## Overview' as section;

SELECT
  'Total Commits: **' || COUNT(*) || '**' as stat
FROM commits
UNION ALL
SELECT
  'Total Files: **' || COUNT(DISTINCT file_path) || '**'
FROM file_changes
UNION ALL
SELECT
  'Contributors: **' || COUNT(DISTINCT author_name) || '**'
FROM commits;

SELECT '' as blank;
SELECT '## Top 5 Contributors' as section;

SELECT
  author_name as 'Author',
  COUNT(*) as 'Commits'
FROM commits
GROUP BY author_name
ORDER BY COUNT(*) DESC
LIMIT 5;
```

## ビューの作成

よく使うクエリはビューとして保存できます：

```sql
-- ファイル統計ビュー
CREATE VIEW file_stats AS
SELECT
  file_path,
  COUNT(*) as change_count,
  SUM(lines_added) as total_added,
  SUM(lines_deleted) as total_deleted,
  SUM(lines_added + lines_deleted) as total_changes
FROM file_changes
GROUP BY file_path;

-- 使用例
SELECT * FROM file_stats ORDER BY change_count DESC LIMIT 10;

-- 作成者統計ビュー
CREATE VIEW author_stats AS
SELECT
  c.author_name,
  COUNT(DISTINCT c.commit_hash) as commits,
  COUNT(DISTINCT fc.file_path) as files_touched,
  SUM(fc.lines_added) as total_added,
  SUM(fc.lines_deleted) as total_deleted
FROM commits c
JOIN file_changes fc ON c.commit_hash = fc.commit_hash
GROUP BY c.author_name;

-- 使用例
SELECT * FROM author_stats ORDER BY commits DESC;
```

## パフォーマンスのヒント

```sql
-- インデックスを確認
SELECT * FROM duckdb_indexes();

-- クエリの実行計画を表示
EXPLAIN SELECT * FROM commits WHERE author_name = 'kasama';

-- クエリ統計を有効化
PRAGMA enable_profiling;
SELECT ... ; -- クエリを実行
PRAGMA disable_profiling;
```

## 参考リンク

- [DuckDB SQL Reference](https://duckdb.org/docs/sql/introduction)
- [DuckDB Functions](https://duckdb.org/docs/sql/functions/overview)
- [DuckDB CLI](https://duckdb.org/docs/api/cli)

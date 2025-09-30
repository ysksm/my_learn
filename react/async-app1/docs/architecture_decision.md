# アーキテクチャ設計の判断基準

## Component → Repository vs Component → UseCase → Repository

### 現状の実装パターン分析

このプロジェクトでは2つの異なるパターンが混在しています：

#### パターン1: Component → UseCase → Repository
```typescript
// UserList.tsx
const getUsersUseCase = container.getUsersUseCase();
useAsyncState((signal) => getUsersUseCase.execute(signal), []);
```

#### パターン2: Component → Repository (直接)
```typescript
// PollingData.tsx
const pollRepository = container.getPollRepository();
usePolling((signal) => pollRepository.getPollData(signal), 2000, false);
```

## UseCaseを挟むべきか？批判的評価

### 賛成意見（UseCaseを挟むべき）

1. **レイヤーの一貫性**
   - DDDアーキテクチャを採用している以上、全てのビジネスロジックをApplication層に集約すべき
   - アーキテクチャの純粋性を保つことで、コードの予測可能性が向上

2. **将来の拡張性**
   - ビジネスルールが追加される可能性がある
     - データの加工・変換
     - 複数リポジトリの組み合わせ
     - キャッシュ戦略の実装
     - バリデーションロジックの追加

3. **テスタビリティ**
   - UseCaseをモックすれば、プレゼンテーション層のテストが容易
   - ビジネスロジックを独立してテスト可能

4. **単一責任原則**
   - Componentはビューの責務のみに集中すべき
   - データ取得の詳細はApplication層に隠蔽

### 反対意見（直接Repositoryを呼ぶべき）

1. **YAGNI原則違反（You Aren't Gonna Need It）**
   - 現状のPollDataは単純なCRUD操作のみ
   - UseCaseが単なるパススルーになっている（over-engineering）
   - 実際に必要になってから作るべき

2. **不要な抽象化コスト**
   - ファイル数が増える → メンテナンスコスト増
   - ボイラープレートコードが増える → 可読性低下
   - デバッグ時のスタックトレースが深くなる → デバッグ効率低下

3. **Reactの思想との不整合**
   - Reactエコシステムでは「データ取得はコンポーネント近くで」が一般的
   - React Query、SWR、Apollo Client等はRepository相当を直接呼び出す設計
   - フロントエンドでの過度なレイヤー分割は実用的でない場合が多い

4. **学習プロジェクトでの過剰設計**
   - このプロジェクトの目的は「非同期処理の学習」
   - アーキテクチャの純粋性追求は本来の目的から逸脱する可能性

### 具体例での比較

#### GetUsersUseCase（ビジネスロジックあり）
```typescript
async execute(signal?: AbortSignal): Promise<Result<UserDto[], RepositoryError>> {
  const result = await this.userRepository.getAllUsers(signal);
  if (result.isError()) {
    return Result.error(result.getError());
  }
  // 👍 Entity → DTOの変換というビジネスロジックがある
  const userDtos = UserDto.fromEntities(result.getValue());
  return Result.success(userDtos);
}
```
**評価**: ✅ 有用 - Entity → DTOの変換というビジネスロジックが存在

#### PollData UseCase（仮に作成した場合）
```typescript
async execute(signal?: AbortSignal) {
  // 👎 単なるパススルー - 何のロジックも追加していない
  return await this.pollRepository.getPollData(signal);
}
```
**評価**: ❌ 無用 - 何の価値も追加していない

## 推奨アプローチ：プラグマティックな判断基準

### UseCaseを作成すべきケース

以下のいずれかに該当する場合はUseCaseを作成：

- ✅ Entity → DTOの変換が必要
- ✅ 複数のRepositoryを組み合わせる必要がある
- ✅ ビジネスルールの検証が存在する
- ✅ トランザクション境界の管理が必要
- ✅ 複雑なエラーハンドリングロジックがある
- ✅ キャッシュ戦略などの横断的関心事がある

### 直接Repositoryを呼んでもよいケース

以下のすべてに該当する場合は直接Repository呼び出しを許可：

- ✅ 単純なCRUD操作のみ
- ✅ データ変換が不要（Entityがそのまま使える）
- ✅ ビジネスロジックが存在しない
- ✅ 単一のRepositoryのみで完結する

### 現状の評価と推奨

| Component | 現状パターン | ビジネスロジック | 評価 | 推奨アクション |
|-----------|-------------|----------------|------|--------------|
| UserList | UseCase経由 | Entity→DTO変換あり | ✅ 適切 | 現状維持 |
| PollingData | Repository直接 | なし（単純CRUD） | ⚠️ 一貫性欠如 | 統一のためUseCase追加を検討 |
| TimeoutTest | Repository直接 | なし | ⚠️ 一貫性欠如 | 統一のためUseCase追加を検討 |
| MultipleApiTest | Repository直接 | なし | ⚠️ 一貫性欠如 | 統一のためUseCase追加を検討 |

## 結論と統一方針

### 問題点
現状のような**混在は明確にNG**です。チーム内で判断基準が不明瞭になり、コードベースの一貫性が失われます。

### 選択肢

#### 選択肢A：プラグマティックアプローチ
- UseCaseはビジネスロジックがある場合のみ作成
- 単純なCRUDは直接Repository呼び出しを許可
- プロジェクト内で明確な判断基準を文書化（上記参照）

**メリット**:
- 不要なボイラープレート削減
- 実用的で保守しやすい
- 必要な時に必要な抽象化を追加

**デメリット**:
- 一貫性がやや損なわれる
- 判断基準の共有が必要

#### 選択肢B：純粋主義アプローチ
- 全てUseCaseを経由させる
- 一貫性とアーキテクチャの純粋性を重視
- パススルーUseCaseも許容する

**メリット**:
- 完全な一貫性
- 将来の変更に強い
- アーキテクチャが明確

**デメリット**:
- ボイラープレートコード増加
- 過剰な抽象化の可能性
- 学習コストが高い

### このプロジェクトでの推奨：選択肢A（プラグマティック）

**理由**:
1. **プロジェクトの目的**: 「非同期処理の学習」が主目的であり、「DDDの完璧な実装」ではない
2. **実務での実用性**: 過剰な抽象化は実際の業務では保守コストになることが多い
3. **学習効果**: 「いつ抽象化すべきか」の判断力を養うことができる

**ただし**: 現在のコードベースの一貫性のために、残りのコンポーネント（PollingData、TimeoutTest等）もUseCaseを経由させることを推奨します。これにより：
- コードベース全体の一貫性が保たれる
- 新しい開発者が迷わない
- 将来の拡張時にパターンが明確

## 実装ガイドライン

### 新機能追加時のチェックリスト

新しい機能を追加する際は、以下をチェック：

1. [ ] ビジネスロジック（データ変換、複数Repository組み合わせ等）が必要か？
2. [ ] YES → UseCase作成
3. [ ] NO → 既存のパターンに合わせる（一貫性重視）

### コードレビュー時のチェックポイント

- [ ] Component → Repository直接呼び出しに正当な理由があるか？
- [ ] UseCaseが単なるパススルーになっていないか？
- [ ] プロジェクト内で一貫性が保たれているか？

## 参考リンク

- [YAGNI - You Aren't Gonna Need It](https://martinfowler.com/bliki/Yagni.html)
- [DDD: Application Services vs Domain Services](https://stackoverflow.com/questions/2268699/domain-driven-design-domain-service-application-service)
- [React Query: Don't Over-Abstract](https://tkdodo.eu/blog/react-query-and-type-script)
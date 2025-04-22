// 共通の型定義

// ID型
export type ID = string;

// エンティティの基本インターフェース
export interface Entity {
  id: ID;
}

// タイムスタンプ付きエンティティ
export interface TimestampedEntity extends Entity {
  createdAt: string;
  updatedAt: string;
}

// 商談ステージの列挙型
export enum OpportunityStage {
  PROSPECTING = 'prospecting',
  QUALIFICATION = 'qualification',
  NEEDS_ANALYSIS = 'needs_analysis',
  VALUE_PROPOSITION = 'value_proposition',
  DECISION_MAKERS = 'decision_makers',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

// 活動タイプの列挙型
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  TASK = 'task',
}

// 関連先タイプの列挙型
export enum RelatedToType {
  ACCOUNT = 'account',
  OPPORTUNITY = 'opportunity',
}

// 関連先の型
export interface RelatedTo {
  type: RelatedToType;
  id: ID;
}

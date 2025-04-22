import { ID, OpportunityStage, TimestampedEntity } from '../../types';

/**
 * 商談エンティティ
 */
export interface Opportunity extends TimestampedEntity {
  accountId: ID;
  name: string;
  stage: OpportunityStage;
  amount: number;
  closeDate?: string;
  probability?: number;
  description?: string;
}

/**
 * 商談の作成用DTO
 */
export interface CreateOpportunityDTO {
  accountId: ID;
  name: string;
  stage?: OpportunityStage;
  amount: number;
  closeDate?: string;
  probability?: number;
  description?: string;
}

/**
 * 商談の更新用DTO
 */
export interface UpdateOpportunityDTO {
  id: ID;
  accountId?: ID;
  name?: string;
  stage?: OpportunityStage;
  amount?: number;
  closeDate?: string;
  probability?: number;
  description?: string;
}

/**
 * 新しい商談エンティティを作成する
 */
export function createOpportunity(dto: CreateOpportunityDTO): Opportunity {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ...dto,
    stage: dto.stage ?? OpportunityStage.PROSPECTING,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 商談エンティティを更新する
 */
export function updateOpportunity(opportunity: Opportunity, dto: UpdateOpportunityDTO): Opportunity {
  return {
    ...opportunity,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 商談ステージを進める
 */
export function advanceOpportunityStage(opportunity: Opportunity): Opportunity {
  const stages = Object.values(OpportunityStage);
  const currentIndex = stages.indexOf(opportunity.stage);
  
  // 既に最終ステージの場合は変更しない
  if (currentIndex === stages.length - 1) {
    return opportunity;
  }
  
  return {
    ...opportunity,
    stage: stages[currentIndex + 1],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 商談ステージを戻す
 */
export function regressOpportunityStage(opportunity: Opportunity): Opportunity {
  const stages = Object.values(OpportunityStage);
  const currentIndex = stages.indexOf(opportunity.stage);
  
  // 既に最初のステージの場合は変更しない
  if (currentIndex === 0) {
    return opportunity;
  }
  
  return {
    ...opportunity,
    stage: stages[currentIndex - 1],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 商談を成立させる
 */
export function closeWonOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    stage: OpportunityStage.CLOSED_WON,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 商談を失注させる
 */
export function closeLostOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    stage: OpportunityStage.CLOSED_LOST,
    updatedAt: new Date().toISOString(),
  };
}

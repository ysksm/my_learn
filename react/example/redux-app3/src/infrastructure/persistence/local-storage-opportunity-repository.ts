import { Opportunity } from '../../domain/model';
import { OpportunityRepository } from '../../domain/repository';
import { ID, OpportunityStage } from '../../types';
import { LocalStorageRepository } from './local-storage-repository';

/**
 * LocalStorageを使用した商談リポジトリの実装
 */
export class LocalStorageOpportunityRepository extends LocalStorageRepository<Opportunity> implements OpportunityRepository {
  constructor() {
    super('opportunities');
  }

  /**
   * 取引先IDで商談を検索する
   */
  async findByAccountId(accountId: ID): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => opportunity.accountId === accountId);
  }

  /**
   * ステージで商談を検索する
   */
  async findByStage(stage: OpportunityStage): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => opportunity.stage === stage);
  }

  /**
   * 金額範囲で商談を検索する
   */
  async findByAmountRange(minAmount: number, maxAmount: number): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => opportunity.amount >= minAmount && opportunity.amount <= maxAmount);
  }

  /**
   * 成立した商談を検索する
   */
  async findClosedWon(): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => opportunity.stage === OpportunityStage.CLOSED_WON);
  }

  /**
   * 失注した商談を検索する
   */
  async findClosedLost(): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => opportunity.stage === OpportunityStage.CLOSED_LOST);
  }

  /**
   * 進行中の商談を検索する
   */
  async findOpen(): Promise<Opportunity[]> {
    const opportunities = await this.findAll();
    return opportunities.filter(opportunity => 
      opportunity.stage !== OpportunityStage.CLOSED_WON && 
      opportunity.stage !== OpportunityStage.CLOSED_LOST
    );
  }
}

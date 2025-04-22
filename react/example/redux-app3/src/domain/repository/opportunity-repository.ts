import { Opportunity } from '../model';
import { ID, OpportunityStage } from '../../types';
import { Repository } from './repository';

/**
 * 商談リポジトリのインターフェース
 */
export interface OpportunityRepository extends Repository<Opportunity> {
  /**
   * 取引先IDで商談を検索する
   */
  findByAccountId(accountId: ID): Promise<Opportunity[]>;

  /**
   * ステージで商談を検索する
   */
  findByStage(stage: OpportunityStage): Promise<Opportunity[]>;

  /**
   * 金額範囲で商談を検索する
   */
  findByAmountRange(minAmount: number, maxAmount: number): Promise<Opportunity[]>;

  /**
   * 成立した商談を検索する
   */
  findClosedWon(): Promise<Opportunity[]>;

  /**
   * 失注した商談を検索する
   */
  findClosedLost(): Promise<Opportunity[]>;

  /**
   * 進行中の商談を検索する
   */
  findOpen(): Promise<Opportunity[]>;
}

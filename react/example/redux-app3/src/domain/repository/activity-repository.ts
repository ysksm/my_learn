import { Activity } from '../model';
import { ActivityType, ID, RelatedToType } from '../../types';
import { Repository } from './repository';

/**
 * 活動リポジトリのインターフェース
 */
export interface ActivityRepository extends Repository<Activity> {
  /**
   * 関連先タイプとIDで活動を検索する
   */
  findByRelatedTo(type: RelatedToType, id: ID): Promise<Activity[]>;

  /**
   * 活動タイプで活動を検索する
   */
  findByType(type: ActivityType): Promise<Activity[]>;

  /**
   * 日付範囲で活動を検索する
   */
  findByDateRange(startDate: string, endDate: string): Promise<Activity[]>;

  /**
   * ステータスで活動を検索する
   */
  findByStatus(status: 'planned' | 'completed' | 'canceled'): Promise<Activity[]>;

  /**
   * 予定されている活動を検索する
   */
  findPlanned(): Promise<Activity[]>;

  /**
   * 完了した活動を検索する
   */
  findCompleted(): Promise<Activity[]>;

  /**
   * キャンセルされた活動を検索する
   */
  findCanceled(): Promise<Activity[]>;
}

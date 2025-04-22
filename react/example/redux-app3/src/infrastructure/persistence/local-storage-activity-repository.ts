import { Activity } from '../../domain/model';
import { ActivityRepository } from '../../domain/repository';
import { ActivityType, ID, RelatedToType } from '../../types';
import { LocalStorageRepository } from './local-storage-repository';

/**
 * LocalStorageを使用した活動リポジトリの実装
 */
export class LocalStorageActivityRepository extends LocalStorageRepository<Activity> implements ActivityRepository {
  constructor() {
    super('activities');
  }

  /**
   * 関連先タイプとIDで活動を検索する
   */
  async findByRelatedTo(type: RelatedToType, id: ID): Promise<Activity[]> {
    const activities = await this.findAll();
    return activities.filter(activity => 
      activity.relatedTo.type === type && activity.relatedTo.id === id
    );
  }

  /**
   * 活動タイプで活動を検索する
   */
  async findByType(type: ActivityType): Promise<Activity[]> {
    const activities = await this.findAll();
    return activities.filter(activity => activity.type === type);
  }

  /**
   * 日付範囲で活動を検索する
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Activity[]> {
    const activities = await this.findAll();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.date).getTime();
      return activityDate >= start && activityDate <= end;
    });
  }

  /**
   * ステータスで活動を検索する
   */
  async findByStatus(status: 'planned' | 'completed' | 'canceled'): Promise<Activity[]> {
    const activities = await this.findAll();
    return activities.filter(activity => activity.status === status);
  }

  /**
   * 予定されている活動を検索する
   */
  async findPlanned(): Promise<Activity[]> {
    return this.findByStatus('planned');
  }

  /**
   * 完了した活動を検索する
   */
  async findCompleted(): Promise<Activity[]> {
    return this.findByStatus('completed');
  }

  /**
   * キャンセルされた活動を検索する
   */
  async findCanceled(): Promise<Activity[]> {
    return this.findByStatus('canceled');
  }
}

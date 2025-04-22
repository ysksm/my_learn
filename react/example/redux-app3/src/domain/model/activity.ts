import { ActivityType, ID, RelatedTo, TimestampedEntity } from '../../types';

/**
 * 活動エンティティ
 */
export interface Activity extends TimestampedEntity {
  relatedTo: RelatedTo;
  type: ActivityType;
  subject: string;
  date: string;
  dueDate?: string;
  status?: 'planned' | 'completed' | 'canceled';
  description?: string;
  assignedTo?: string;
}

/**
 * 活動の作成用DTO
 */
export interface CreateActivityDTO {
  relatedTo: RelatedTo;
  type: ActivityType;
  subject: string;
  date: string;
  dueDate?: string;
  status?: 'planned' | 'completed' | 'canceled';
  description?: string;
  assignedTo?: string;
}

/**
 * 活動の更新用DTO
 */
export interface UpdateActivityDTO {
  id: ID;
  relatedTo?: RelatedTo;
  type?: ActivityType;
  subject?: string;
  date?: string;
  dueDate?: string;
  status?: 'planned' | 'completed' | 'canceled';
  description?: string;
  assignedTo?: string;
}

/**
 * 新しい活動エンティティを作成する
 */
export function createActivity(dto: CreateActivityDTO): Activity {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ...dto,
    status: dto.status ?? 'planned',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 活動エンティティを更新する
 */
export function updateActivity(activity: Activity, dto: UpdateActivityDTO): Activity {
  return {
    ...activity,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 活動を完了としてマークする
 */
export function completeActivity(activity: Activity): Activity {
  return {
    ...activity,
    status: 'completed',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 活動をキャンセルとしてマークする
 */
export function cancelActivity(activity: Activity): Activity {
  return {
    ...activity,
    status: 'canceled',
    updatedAt: new Date().toISOString(),
  };
}

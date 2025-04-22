import { ID, TimestampedEntity } from '../../types';

/**
 * 取引先エンティティ
 */
export interface Account extends TimestampedEntity {
  name: string;
  industry: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

/**
 * 取引先の作成用DTO
 */
export interface CreateAccountDTO {
  name: string;
  industry: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

/**
 * 取引先の更新用DTO
 */
export interface UpdateAccountDTO {
  id: ID;
  name?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

/**
 * 新しい取引先エンティティを作成する
 */
export function createAccount(dto: CreateAccountDTO): Account {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    ...dto,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 取引先エンティティを更新する
 */
export function updateAccount(account: Account, dto: UpdateAccountDTO): Account {
  return {
    ...account,
    ...dto,
    updatedAt: new Date().toISOString(),
  };
}

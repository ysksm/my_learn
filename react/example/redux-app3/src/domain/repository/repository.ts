import { Entity, ID } from '../../types';

/**
 * リポジトリの基本インターフェース
 */
export interface Repository<T extends Entity> {
  /**
   * エンティティを保存する
   */
  save(entity: T): Promise<T>;

  /**
   * 複数のエンティティを保存する
   */
  saveAll(entities: T[]): Promise<T[]>;

  /**
   * IDによってエンティティを取得する
   */
  findById(id: ID): Promise<T | null>;

  /**
   * すべてのエンティティを取得する
   */
  findAll(): Promise<T[]>;

  /**
   * 条件に一致するエンティティを取得する
   */
  findBy(predicate: (entity: T) => boolean): Promise<T[]>;

  /**
   * IDによってエンティティを削除する
   */
  deleteById(id: ID): Promise<boolean>;

  /**
   * エンティティを削除する
   */
  delete(entity: T): Promise<boolean>;

  /**
   * すべてのエンティティを削除する
   */
  deleteAll(): Promise<boolean>;
}

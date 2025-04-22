import { Entity, ID } from '../../types';
import { Repository } from '../../domain/repository';

/**
 * LocalStorageを使用したリポジトリの基本実装
 */
export class LocalStorageRepository<T extends Entity> implements Repository<T> {
  private readonly storageKey: string;

  constructor(entityName: string) {
    this.storageKey = `crm_${entityName}`;
  }

  /**
   * エンティティを保存する
   */
  async save(entity: T): Promise<T> {
    const entities = await this.findAll();
    const index = entities.findIndex(e => e.id === entity.id);

    if (index >= 0) {
      // 既存のエンティティを更新
      entities[index] = entity;
    } else {
      // 新しいエンティティを追加
      entities.push(entity);
    }

    this.saveToStorage(entities);
    this.dispatchStorageEvent(entity.id);
    return entity;
  }

  /**
   * 複数のエンティティを保存する
   */
  async saveAll(entities: T[]): Promise<T[]> {
    const existingEntities = await this.findAll();
    const updatedEntities = [...existingEntities];

    for (const entity of entities) {
      const index = updatedEntities.findIndex(e => e.id === entity.id);
      if (index >= 0) {
        updatedEntities[index] = entity;
      } else {
        updatedEntities.push(entity);
      }
    }

    this.saveToStorage(updatedEntities);
    this.dispatchStorageEvent();
    return entities;
  }

  /**
   * IDによってエンティティを取得する
   */
  async findById(id: ID): Promise<T | null> {
    const entities = await this.findAll();
    return entities.find(entity => entity.id === id) || null;
  }

  /**
   * すべてのエンティティを取得する
   */
  async findAll(): Promise<T[]> {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error parsing ${this.storageKey} from localStorage:`, error);
      return [];
    }
  }

  /**
   * 条件に一致するエンティティを取得する
   */
  async findBy(predicate: (entity: T) => boolean): Promise<T[]> {
    const entities = await this.findAll();
    return entities.filter(predicate);
  }

  /**
   * IDによってエンティティを削除する
   */
  async deleteById(id: ID): Promise<boolean> {
    const entities = await this.findAll();
    const filteredEntities = entities.filter(entity => entity.id !== id);

    if (filteredEntities.length === entities.length) {
      // 削除対象が見つからなかった
      return false;
    }

    this.saveToStorage(filteredEntities);
    this.dispatchStorageEvent(id);
    return true;
  }

  /**
   * エンティティを削除する
   */
  async delete(entity: T): Promise<boolean> {
    return this.deleteById(entity.id);
  }

  /**
   * すべてのエンティティを削除する
   */
  async deleteAll(): Promise<boolean> {
    localStorage.removeItem(this.storageKey);
    this.dispatchStorageEvent();
    return true;
  }

  /**
   * LocalStorageにエンティティを保存する
   */
  private saveToStorage(entities: T[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(entities));
  }

  /**
   * LocalStorageの変更イベントを発火する
   * これにより、他のタブでも変更が反映される
   */
  private dispatchStorageEvent(id?: ID): void {
    // カスタムイベントを発火して、同一ドメイン内の他のタブに変更を通知
    const event = new StorageEvent('storage', {
      key: this.storageKey,
      newValue: localStorage.getItem(this.storageKey),
      url: window.location.href,
      storageArea: localStorage,
    });

    // イベントをディスパッチ
    window.dispatchEvent(event);
  }
}

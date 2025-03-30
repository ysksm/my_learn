import { StorageAdapter } from './storage-adapter';

/**
 * LocalStorage implementation of the StorageAdapter interface
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
      throw error;
    }
  }

  async getAllItems<T>(keyPrefix: string): Promise<T[]> {
    try {
      const items: T[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(keyPrefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            items.push(JSON.parse(item));
          }
        }
      }
      return items;
    } catch (error) {
      console.error(`Error getting all items from localStorage: ${error}`);
      return [];
    }
  }

  async clear(keyPrefix?: string): Promise<void> {
    try {
      if (keyPrefix) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(keyPrefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
      throw error;
    }
  }
}

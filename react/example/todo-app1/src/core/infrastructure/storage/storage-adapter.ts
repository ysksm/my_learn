/**
 * Storage Adapter Interface
 * This interface abstracts the storage mechanism, allowing for different implementations
 * such as LocalStorage, IndexedDB, or API-based storage.
 */
export interface StorageAdapter {
  /**
   * Retrieves an item from storage by key
   * @param key The key of the item to retrieve
   * @returns The item if found, null otherwise
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * Stores an item in storage
   * @param key The key to store the item under
   * @param value The item to store
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * Removes an item from storage
   * @param key The key of the item to remove
   */
  removeItem(key: string): Promise<void>;

  /**
   * Retrieves all items with keys that start with the given prefix
   * @param keyPrefix The prefix to filter keys by
   * @returns An array of items
   */
  getAllItems<T>(keyPrefix: string): Promise<T[]>;

  /**
   * Clears all items from storage, or all items with keys that start with the given prefix
   * @param keyPrefix Optional prefix to limit which items are cleared
   */
  clear(keyPrefix?: string): Promise<void>;
}

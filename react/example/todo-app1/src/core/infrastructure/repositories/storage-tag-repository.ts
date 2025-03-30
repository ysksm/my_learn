import { Tag } from '../../domain/models/tag';
import { TagRepository, TagFilter } from '../../domain/repositories/tag-repository';
import { StorageAdapter } from '../storage/storage-adapter';

export class StorageTagRepository implements TagRepository {
  private readonly TAG_KEY_PREFIX = 'tag:';
  
  constructor(private storageAdapter: StorageAdapter) {}

  async findById(id: string): Promise<Tag | null> {
    const data = await this.storageAdapter.getItem<any>(`${this.TAG_KEY_PREFIX}${id}`);
    return data ? this.mapToTag(data) : null;
  }

  async findAll(filter?: TagFilter): Promise<Tag[]> {
    const allTags = await this.storageAdapter.getAllItems<any>(this.TAG_KEY_PREFIX);
    const tags = allTags.map(data => this.mapToTag(data));
    
    if (!filter) return tags;
    
    return tags.filter(tag => {
      let matches = true;
      
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const nameMatches = tag.name.toLowerCase().includes(searchText);
        if (!nameMatches) {
          matches = false;
        }
      }
      
      return matches;
    });
  }

  async save(tag: Tag): Promise<void> {
    const data = this.mapFromTag(tag);
    await this.storageAdapter.setItem(`${this.TAG_KEY_PREFIX}${tag.id}`, data);
  }

  async remove(id: string): Promise<void> {
    await this.storageAdapter.removeItem(`${this.TAG_KEY_PREFIX}${id}`);
  }

  private mapToTag(data: any): Tag {
    return new Tag({
      name: data.name,
      color: data.color
    }, data.id);
  }

  private mapFromTag(tag: Tag): any {
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color
    };
  }
}

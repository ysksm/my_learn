import { Tag } from '../models/tag';

export interface TagFilter {
  searchText?: string;
}

export interface TagRepository {
  findById(id: string): Promise<Tag | null>;
  findAll(filter?: TagFilter): Promise<Tag[]>;
  save(tag: Tag): Promise<void>;
  remove(id: string): Promise<void>;
}

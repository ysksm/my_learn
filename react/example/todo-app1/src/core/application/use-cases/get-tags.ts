import { TagRepository, TagFilter } from '../../domain/repositories/tag-repository';
import { Tag } from '../../domain/models/tag';
import { TagDTO } from '../dtos/tag-dtos';

export class GetTagsUseCase {
  constructor(private tagRepository: TagRepository) {}

  /**
   * Get all tags matching the filter
   * @param filter Optional filter criteria
   * @returns Array of tags
   */
  async execute(filter?: TagFilter): Promise<Tag[]> {
    return this.tagRepository.findAll(filter);
  }

  /**
   * Get all tags matching the filter as DTOs
   * @param filter Optional filter criteria
   * @returns Array of tag DTOs
   */
  async executeDTO(filter?: TagFilter): Promise<TagDTO[]> {
    const tags = await this.tagRepository.findAll(filter);
    return tags.map(tag => this.mapToDTO(tag));
  }

  private mapToDTO(tag: Tag): TagDTO {
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color
    };
  }
}

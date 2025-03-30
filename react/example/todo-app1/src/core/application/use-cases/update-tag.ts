import { TagRepository } from '../../domain/repositories/tag-repository';
import { UpdateTagDTO } from '../dtos/tag-dtos';
import { Tag } from '../../domain/models/tag';

export class UpdateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  /**
   * Update an existing tag
   * @param dto Tag update data
   * @returns true if successful, false if tag not found
   */
  async execute(dto: UpdateTagDTO): Promise<boolean> {
    // Get the tag
    const tag = await this.tagRepository.findById(dto.id);
    if (!tag) return false;
    
    // Create a new tag with updated properties
    // Since Tag is immutable, we create a new one with the same ID
    const updatedTag = new Tag({
      name: dto.name !== undefined ? dto.name : tag.name,
      color: dto.color !== undefined ? dto.color : tag.color
    }, tag.id);
    
    // Save the updated tag
    await this.tagRepository.save(updatedTag);
    
    return true;
  }
}

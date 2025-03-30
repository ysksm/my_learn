import { TagRepository } from '../../domain/repositories/tag-repository';
import { Tag } from '../../domain/models/tag';
import { CreateTagDTO } from '../dtos/tag-dtos';

export class CreateTagUseCase {
  constructor(private tagRepository: TagRepository) {}

  /**
   * Create a new tag
   * @param dto Tag creation data
   * @returns ID of the created tag
   */
  async execute(dto: CreateTagDTO): Promise<string> {
    // Create the tag
    const tag = Tag.create({
      name: dto.name,
      color: dto.color
    });
    
    // Save the tag
    await this.tagRepository.save(tag);
    
    return tag.id;
  }
}

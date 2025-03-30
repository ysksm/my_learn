import { Tag } from '../../../core/domain/models/tag';
import { TagViewModel, TagViewModelHelpers } from './tag-view-model';

/**
 * Mapper for converting domain tag models to view models
 */
export class TagViewModelMapper {
  /**
   * Map a domain tag to a view model
   * @param tag Domain tag model
   * @returns Tag view model
   */
  mapToViewModel(tag: Tag): TagViewModel {
    return {
      id: tag.id,
      name: tag.name,
      color: tag.color
    };
  }

  /**
   * Map multiple domain tags to view models
   * @param tags Array of domain tag models
   * @returns Array of tag view models
   */
  mapToViewModels(tags: Tag[]): TagViewModel[] {
    return tags.map(tag => this.mapToViewModel(tag));
  }

  /**
   * Get the contrast color for a tag
   * @param tag Tag view model
   * @returns Contrast color for the tag
   */
  getContrastColor(tag: TagViewModel): string {
    return TagViewModelHelpers.getContrastColor(tag.color);
  }
}

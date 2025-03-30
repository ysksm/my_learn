/**
 * View model for tag list item
 */
export interface TagViewModel {
  id: string;
  name: string;
  color: string;
}

/**
 * Helper functions for tag view models
 */
export const TagViewModelHelpers = {
  /**
   * Get a contrasting text color (black or white) based on the background color
   * @param backgroundColor Background color in hex format (e.g., #ff0000)
   * @returns Text color in hex format (#000000 for black or #ffffff for white)
   */
  getContrastColor(backgroundColor: string): string {
    // Remove the hash if it exists
    const color = backgroundColor.replace('#', '');
    
    // Parse the color
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Calculate the brightness
    // Formula: (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // Return black for bright colors, white for dark colors
    return brightness > 128 ? '#000000' : '#ffffff';
  }
};

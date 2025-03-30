/**
 * DTO for creating a new tag
 */
export interface CreateTagDTO {
  name: string;
  color: string;
}

/**
 * DTO for updating an existing tag
 */
export interface UpdateTagDTO {
  id: string;
  name?: string;
  color?: string;
}

/**
 * DTO for tag details
 */
export interface TagDTO {
  id: string;
  name: string;
  color: string;
}

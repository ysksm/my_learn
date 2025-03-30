import { SprintStatus } from '../../domain/types';

/**
 * DTO for creating a new sprint
 */
export interface CreateSprintDTO {
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
}

/**
 * DTO for updating an existing sprint
 */
export interface UpdateSprintDTO {
  id: string;
  name?: string;
  goal?: string;
  startDate?: Date;
  endDate?: Date;
  status?: SprintStatus;
}

/**
 * DTO for sprint details
 */
export interface SprintDetailsDTO {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  tickets: {
    id: string;
    title: string;
    status: string;
    priority: string;
    type: string;
  }[];
}

/**
 * DTO for sprint list item
 */
export interface SprintListItemDTO {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  ticketCount: number;
}

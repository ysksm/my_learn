import { TicketType, Priority, Severity, Status } from '../../domain/types';

/**
 * DTO for creating a new ticket
 */
export interface CreateTicketDTO {
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
  severity: Severity;
  status: Status;
  tagIds: string[];
  assigneeId?: string;
  reporterId: string;
  dueDate?: Date;
  estimatedHours?: number;
  sprintId?: string;
  parentId?: string;
}

/**
 * DTO for updating an existing ticket
 */
export interface UpdateTicketDTO {
  id: string;
  title?: string;
  description?: string;
  type?: TicketType;
  priority?: Priority;
  severity?: Severity;
  status?: Status;
  tagIds?: string[];
  assigneeId?: string | null; // null means unassign
  dueDate?: Date | null; // null means remove due date
  estimatedHours?: number | null; // null means remove estimated hours
  sprintId?: string | null; // null means remove from sprint
  parentId?: string | null; // null means remove parent
}

/**
 * DTO for ticket details
 */
export interface TicketDetailsDTO {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: Status;
  priority: Priority;
  severity: Severity;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  assignee?: {
    id: string;
    name: string;
  };
  reporter: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedHours?: number;
  sprint?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    title: string;
  };
  children?: {
    id: string;
    title: string;
    status: Status;
  }[];
}

/**
 * DTO for ticket list item
 */
export interface TicketListItemDTO {
  id: string;
  title: string;
  type: TicketType;
  status: Status;
  priority: Priority;
  severity: Severity;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  assigneeId?: string;
  dueDate?: string;
  sprintId?: string;
}

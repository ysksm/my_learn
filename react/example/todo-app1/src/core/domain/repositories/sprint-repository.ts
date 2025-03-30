import { Sprint } from '../models/sprint';
import { SprintStatus } from '../types';

export interface SprintFilter {
  status?: SprintStatus[];
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  searchText?: string;
}

export interface SprintRepository {
  findById(id: string): Promise<Sprint | null>;
  findAll(filter?: SprintFilter): Promise<Sprint[]>;
  save(sprint: Sprint): Promise<void>;
  remove(id: string): Promise<void>;
  addTicketToSprint(sprintId: string, ticketId: string): Promise<void>;
  removeTicketFromSprint(sprintId: string, ticketId: string): Promise<void>;
}

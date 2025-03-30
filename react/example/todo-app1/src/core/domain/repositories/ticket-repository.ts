import { Ticket } from '../models/ticket';
import { TicketType, Priority, Severity, Status } from '../types';

export interface TicketFilter {
  types?: TicketType[];
  priorities?: Priority[];
  severities?: Severity[];
  statuses?: Status[];
  tagIds?: string[];
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  parentId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  searchText?: string;
}

export interface TicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findAll(filter?: TicketFilter): Promise<Ticket[]>;
  save(ticket: Ticket): Promise<void>;
  remove(id: string): Promise<void>;
}

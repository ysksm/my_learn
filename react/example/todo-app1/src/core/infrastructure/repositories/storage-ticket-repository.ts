import { Ticket } from '../../domain/models/ticket';
import { TicketRepository, TicketFilter } from '../../domain/repositories/ticket-repository';
import { StorageAdapter } from '../storage/storage-adapter';
import { Tag } from '../../domain/models/tag';

export class StorageTicketRepository implements TicketRepository {
  private readonly TICKET_KEY_PREFIX = 'ticket:';
  
  constructor(private storageAdapter: StorageAdapter) {}

  async findById(id: string): Promise<Ticket | null> {
    const data = await this.storageAdapter.getItem<any>(`${this.TICKET_KEY_PREFIX}${id}`);
    return data ? this.mapToTicket(data) : null;
  }

  async findAll(filter?: TicketFilter): Promise<Ticket[]> {
    const allTickets = await this.storageAdapter.getAllItems<any>(this.TICKET_KEY_PREFIX);
    const tickets = allTickets.map(data => this.mapToTicket(data));
    
    if (!filter) return tickets;
    
    return tickets.filter(ticket => {
      let matches = true;
      
      if (filter.types?.length && !filter.types.includes(ticket.type)) {
        matches = false;
      }
      
      if (filter.priorities?.length && !filter.priorities.includes(ticket.priority)) {
        matches = false;
      }
      
      if (filter.severities?.length && !filter.severities.includes(ticket.severity)) {
        matches = false;
      }
      
      if (filter.statuses?.length && !filter.statuses.includes(ticket.status)) {
        matches = false;
      }
      
      if (filter.tagIds?.length && !ticket.tags.some(tag => filter.tagIds?.includes(tag.id))) {
        matches = false;
      }
      
      if (filter.assigneeId && ticket.assigneeId !== filter.assigneeId) {
        matches = false;
      }
      
      if (filter.reporterId && ticket.reporterId !== filter.reporterId) {
        matches = false;
      }
      
      if (filter.sprintId && ticket.sprintId !== filter.sprintId) {
        matches = false;
      }
      
      if (filter.parentId && ticket.parentId !== filter.parentId) {
        matches = false;
      }
      
      if (filter.dueDateFrom && (!ticket.dueDate || ticket.dueDate < filter.dueDateFrom)) {
        matches = false;
      }
      
      if (filter.dueDateTo && (!ticket.dueDate || ticket.dueDate > filter.dueDateTo)) {
        matches = false;
      }
      
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const titleMatches = ticket.title.toLowerCase().includes(searchText);
        const descriptionMatches = ticket.description.toLowerCase().includes(searchText);
        if (!titleMatches && !descriptionMatches) {
          matches = false;
        }
      }
      
      return matches;
    });
  }

  async save(ticket: Ticket): Promise<void> {
    const data = this.mapFromTicket(ticket);
    await this.storageAdapter.setItem(`${this.TICKET_KEY_PREFIX}${ticket.id}`, data);
  }

  async remove(id: string): Promise<void> {
    await this.storageAdapter.removeItem(`${this.TICKET_KEY_PREFIX}${id}`);
  }

  private mapToTicket(data: any): Ticket {
    return new Ticket({
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      priority: data.priority,
      severity: data.severity,
      tags: data.tags.map((tagData: any) => new Tag({
        name: tagData.name,
        color: tagData.color
      }, tagData.id)),
      assigneeId: data.assigneeId,
      reporterId: data.reporterId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      estimatedHours: data.estimatedHours,
      sprintId: data.sprintId,
      parentId: data.parentId
    }, data.id);
  }

  private mapFromTicket(ticket: Ticket): any {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      status: ticket.status,
      priority: ticket.priority,
      severity: ticket.severity,
      tags: ticket.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })),
      assigneeId: ticket.assigneeId,
      reporterId: ticket.reporterId,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      dueDate: ticket.dueDate?.toISOString(),
      estimatedHours: ticket.estimatedHours,
      sprintId: ticket.sprintId,
      parentId: ticket.parentId
    };
  }
}

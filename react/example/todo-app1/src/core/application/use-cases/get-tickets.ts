import { TicketRepository, TicketFilter } from '../../domain/repositories/ticket-repository';
import { Ticket } from '../../domain/models/ticket';
import { TicketListItemDTO } from '../dtos/ticket-dtos';

export class GetTicketsUseCase {
  constructor(private ticketRepository: TicketRepository) {}

  /**
   * Get all tickets matching the filter
   * @param filter Optional filter criteria
   * @returns Array of tickets
   */
  async execute(filter?: TicketFilter): Promise<Ticket[]> {
    return this.ticketRepository.findAll(filter);
  }

  /**
   * Get all tickets matching the filter as DTOs
   * @param filter Optional filter criteria
   * @returns Array of ticket DTOs
   */
  async executeDTO(filter?: TicketFilter): Promise<TicketListItemDTO[]> {
    const tickets = await this.ticketRepository.findAll(filter);
    return tickets.map(ticket => this.mapToDTO(ticket));
  }

  private mapToDTO(ticket: Ticket): TicketListItemDTO {
    return {
      id: ticket.id,
      title: ticket.title,
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
      dueDate: ticket.dueDate?.toISOString(),
      sprintId: ticket.sprintId
    };
  }
}

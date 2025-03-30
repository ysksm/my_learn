import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { Ticket } from '../../domain/models/ticket';
import { TicketDetailsDTO } from '../dtos/ticket-dtos';
import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { Status } from '../../domain/types';

export class GetTicketByIdUseCase {
  constructor(
    private ticketRepository: TicketRepository,
    private sprintRepository: SprintRepository
  ) {}

  /**
   * Get a ticket by ID
   * @param id Ticket ID
   * @returns Ticket or null if not found
   */
  async execute(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findById(id);
  }

  /**
   * Get a ticket by ID as DTO
   * @param id Ticket ID
   * @returns Ticket DTO or null if not found
   */
  async executeDTO(id: string): Promise<TicketDetailsDTO | null> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) return null;

    // Get parent ticket if exists
    let parent: { id: string; title: string } | undefined = undefined;
    if (ticket.parentId) {
      const parentTicket = await this.ticketRepository.findById(ticket.parentId);
      if (parentTicket) {
        parent = {
          id: parentTicket.id,
          title: parentTicket.title
        };
      }
    }

    // Get children tickets if this is an epic
    let children: { id: string; title: string; status: Status }[] | undefined = undefined;
    if (ticket.type === 'EPIC') {
      const allTickets = await this.ticketRepository.findAll({ parentId: ticket.id });
      if (allTickets.length > 0) {
        children = allTickets.map(child => ({
          id: child.id,
          title: child.title,
          status: child.status
        }));
      }
    }

    // Get sprint if exists
    let sprint: { id: string; name: string } | undefined = undefined;
    if (ticket.sprintId) {
      const sprintEntity = await this.sprintRepository.findById(ticket.sprintId);
      if (sprintEntity) {
        sprint = {
          id: sprintEntity.id,
          name: sprintEntity.name
        };
      }
    }

    // For a real application, we would fetch assignee and reporter details from a user repository
    // Here we'll just use placeholder data
    const assignee = ticket.assigneeId ? {
      id: ticket.assigneeId,
      name: `User ${ticket.assigneeId}`
    } : undefined;

    const reporter = {
      id: ticket.reporterId,
      name: `User ${ticket.reporterId}`
    };

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
      assignee,
      reporter,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      dueDate: ticket.dueDate?.toISOString(),
      estimatedHours: ticket.estimatedHours,
      sprint,
      parent,
      children
    };
  }
}

import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';

export class RemoveTicketFromSprintUseCase {
  constructor(
    private sprintRepository: SprintRepository,
    private ticketRepository: TicketRepository
  ) {}

  /**
   * Remove a ticket from a sprint
   * @param sprintId Sprint ID
   * @param ticketId Ticket ID
   * @returns true if successful, false if sprint or ticket not found
   */
  async execute(sprintId: string, ticketId: string): Promise<boolean> {
    // Check if sprint exists
    const sprint = await this.sprintRepository.findById(sprintId);
    if (!sprint) return false;
    
    // Check if ticket exists
    const ticket = await this.ticketRepository.findById(ticketId);
    if (!ticket) return false;
    
    // Check if ticket is in this sprint
    if (!ticket.sprintId || ticket.sprintId !== sprintId) {
      return false;
    }
    
    // Remove ticket from sprint
    sprint.removeTicket(ticketId);
    await this.sprintRepository.save(sprint);
    
    // Update ticket to remove sprint ID
    ticket.removeFromSprint();
    await this.ticketRepository.save(ticket);
    
    return true;
  }
}

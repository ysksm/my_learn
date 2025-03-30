import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';

export class AddTicketToSprintUseCase {
  constructor(
    private sprintRepository: SprintRepository,
    private ticketRepository: TicketRepository
  ) {}

  /**
   * Add a ticket to a sprint
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
    
    // Check if ticket is already in a sprint
    if (ticket.sprintId) {
      // If it's already in this sprint, do nothing
      if (ticket.sprintId === sprintId) {
        return true;
      }
      
      // If it's in another sprint, remove it from that sprint
      const oldSprint = await this.sprintRepository.findById(ticket.sprintId);
      if (oldSprint) {
        oldSprint.removeTicket(ticketId);
        await this.sprintRepository.save(oldSprint);
      }
    }
    
    // Add ticket to sprint
    sprint.addTicket(ticketId);
    await this.sprintRepository.save(sprint);
    
    // Update ticket with sprint ID
    ticket.assignToSprint(sprintId);
    await this.ticketRepository.save(ticket);
    
    return true;
  }
}

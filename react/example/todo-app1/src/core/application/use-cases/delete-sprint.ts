import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';

export class DeleteSprintUseCase {
  constructor(
    private sprintRepository: SprintRepository,
    private ticketRepository: TicketRepository
  ) {}

  /**
   * Delete a sprint by ID
   * @param id Sprint ID
   * @returns true if successful, false if sprint not found
   */
  async execute(id: string): Promise<boolean> {
    // Check if sprint exists
    const sprint = await this.sprintRepository.findById(id);
    if (!sprint) return false;
    
    // Get all tickets in this sprint
    const tickets = await this.ticketRepository.findAll({ sprintId: id });
    
    // Remove the sprint from all tickets
    for (const ticket of tickets) {
      ticket.removeFromSprint();
      await this.ticketRepository.save(ticket);
    }
    
    // Delete the sprint
    await this.sprintRepository.remove(id);
    
    return true;
  }
}

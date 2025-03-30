import { TicketRepository } from '../../domain/repositories/ticket-repository';

export class DeleteTicketUseCase {
  constructor(private ticketRepository: TicketRepository) {}

  /**
   * Delete a ticket by ID
   * @param id Ticket ID
   * @returns true if successful, false if ticket not found
   */
  async execute(id: string): Promise<boolean> {
    // Check if ticket exists
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) return false;
    
    // Delete the ticket
    await this.ticketRepository.remove(id);
    
    return true;
  }
}

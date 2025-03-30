import { TagRepository } from '../../domain/repositories/tag-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';

export class DeleteTagUseCase {
  constructor(
    private tagRepository: TagRepository,
    private ticketRepository: TicketRepository
  ) {}

  /**
   * Delete a tag by ID
   * @param id Tag ID
   * @returns true if successful, false if tag not found
   */
  async execute(id: string): Promise<boolean> {
    // Check if tag exists
    const tag = await this.tagRepository.findById(id);
    if (!tag) return false;
    
    // Get all tickets with this tag
    const tickets = await this.ticketRepository.findAll();
    
    // Remove the tag from all tickets
    for (const ticket of tickets) {
      const ticketTags = ticket.tags;
      if (ticketTags.some(t => t.id === id)) {
        const updatedTags = ticketTags.filter(t => t.id !== id);
        ticket.updateTags(updatedTags);
        await this.ticketRepository.save(ticket);
      }
    }
    
    // Delete the tag
    await this.tagRepository.remove(id);
    
    return true;
  }
}

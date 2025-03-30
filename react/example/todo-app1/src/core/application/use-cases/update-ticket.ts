import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { TagRepository } from '../../domain/repositories/tag-repository';
import { UpdateTicketDTO } from '../dtos/ticket-dtos';

export class UpdateTicketUseCase {
  constructor(
    private ticketRepository: TicketRepository,
    private tagRepository: TagRepository
  ) {}

  /**
   * Update an existing ticket
   * @param dto Ticket update data
   * @returns true if successful, false if ticket not found
   */
  async execute(dto: UpdateTicketDTO): Promise<boolean> {
    // Get the ticket
    const ticket = await this.ticketRepository.findById(dto.id);
    if (!ticket) return false;
    
    // Update ticket properties
    if (dto.title !== undefined) {
      ticket.updateTitle(dto.title);
    }
    
    if (dto.description !== undefined) {
      ticket.updateDescription(dto.description);
    }
    
    if (dto.status !== undefined) {
      ticket.updateStatus(dto.status);
    }
    
    if (dto.priority !== undefined) {
      ticket.updatePriority(dto.priority);
    }
    
    if (dto.severity !== undefined) {
      ticket.updateSeverity(dto.severity);
    }
    
    if (dto.tagIds !== undefined) {
      // Fetch tags
      const tags = await Promise.all(
        dto.tagIds.map(id => this.tagRepository.findById(id))
      );
      
      // Filter out null values (tags that don't exist)
      const validTags = tags.filter(tag => tag !== null) as any[];
      
      ticket.updateTags(validTags);
    }
    
    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId === null) {
        ticket.unassign();
      } else {
        ticket.assignToUser(dto.assigneeId);
      }
    }
    
    if (dto.dueDate !== undefined) {
      ticket.updateDueDate(dto.dueDate === null ? undefined : dto.dueDate);
    }
    
    if (dto.estimatedHours !== undefined) {
      ticket.updateEstimatedHours(dto.estimatedHours === null ? undefined : dto.estimatedHours);
    }
    
    if (dto.sprintId !== undefined) {
      if (dto.sprintId === null) {
        ticket.removeFromSprint();
      } else {
        ticket.assignToSprint(dto.sprintId);
      }
    }
    
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        ticket.removeParent();
      } else {
        ticket.setParent(dto.parentId);
      }
    }
    
    // Save the updated ticket
    await this.ticketRepository.save(ticket);
    
    return true;
  }
}

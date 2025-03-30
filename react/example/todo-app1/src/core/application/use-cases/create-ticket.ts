import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { TagRepository } from '../../domain/repositories/tag-repository';
import { Ticket } from '../../domain/models/ticket';
import { CreateTicketDTO } from '../dtos/ticket-dtos';

export class CreateTicketUseCase {
  constructor(
    private ticketRepository: TicketRepository,
    private tagRepository: TagRepository
  ) {}

  /**
   * Create a new ticket
   * @param dto Ticket creation data
   * @returns ID of the created ticket
   */
  async execute(dto: CreateTicketDTO): Promise<string> {
    // Fetch tags
    const tags = await Promise.all(
      dto.tagIds.map(id => this.tagRepository.findById(id))
    );
    
    // Filter out null values (tags that don't exist)
    const validTags = tags.filter(tag => tag !== null) as any[];
    
    // Create the ticket
    const ticket = Ticket.create({
      title: dto.title,
      description: dto.description,
      type: dto.type,
      status: dto.status,
      priority: dto.priority,
      severity: dto.severity,
      tags: validTags,
      assigneeId: dto.assigneeId,
      reporterId: dto.reporterId,
      dueDate: dto.dueDate,
      estimatedHours: dto.estimatedHours,
      sprintId: dto.sprintId,
      parentId: dto.parentId
    });
    
    // Save the ticket
    await this.ticketRepository.save(ticket);
    
    return ticket.id;
  }
}

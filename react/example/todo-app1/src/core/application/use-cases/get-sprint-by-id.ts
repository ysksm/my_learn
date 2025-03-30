import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { TicketRepository } from '../../domain/repositories/ticket-repository';
import { Sprint } from '../../domain/models/sprint';
import { SprintDetailsDTO } from '../dtos/sprint-dtos';

export class GetSprintByIdUseCase {
  constructor(
    private sprintRepository: SprintRepository,
    private ticketRepository: TicketRepository
  ) {}

  /**
   * Get a sprint by ID
   * @param id Sprint ID
   * @returns Sprint or null if not found
   */
  async execute(id: string): Promise<Sprint | null> {
    return this.sprintRepository.findById(id);
  }

  /**
   * Get a sprint by ID as DTO
   * @param id Sprint ID
   * @returns Sprint DTO or null if not found
   */
  async executeDTO(id: string): Promise<SprintDetailsDTO | null> {
    const sprint = await this.sprintRepository.findById(id);
    if (!sprint) return null;

    // Get ticket details for all tickets in the sprint
    const ticketDetails = await Promise.all(
      sprint.tickets.map(async (ticketId) => {
        const ticket = await this.ticketRepository.findById(ticketId);
        if (!ticket) return null;
        
        return {
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          type: ticket.type
        };
      })
    );

    // Filter out null values (tickets that don't exist)
    const validTicketDetails = ticketDetails.filter(ticket => ticket !== null) as any[];

    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      status: sprint.status,
      tickets: validTicketDetails
    };
  }
}

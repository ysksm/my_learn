import { SprintRepository, SprintFilter } from '../../domain/repositories/sprint-repository';
import { Sprint } from '../../domain/models/sprint';
import { SprintListItemDTO } from '../dtos/sprint-dtos';

export class GetSprintsUseCase {
  constructor(private sprintRepository: SprintRepository) {}

  /**
   * Get all sprints matching the filter
   * @param filter Optional filter criteria
   * @returns Array of sprints
   */
  async execute(filter?: SprintFilter): Promise<Sprint[]> {
    return this.sprintRepository.findAll(filter);
  }

  /**
   * Get all sprints matching the filter as DTOs
   * @param filter Optional filter criteria
   * @returns Array of sprint DTOs
   */
  async executeDTO(filter?: SprintFilter): Promise<SprintListItemDTO[]> {
    const sprints = await this.sprintRepository.findAll(filter);
    return sprints.map(sprint => this.mapToDTO(sprint));
  }

  private mapToDTO(sprint: Sprint): SprintListItemDTO {
    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      status: sprint.status,
      ticketCount: sprint.tickets.length
    };
  }
}

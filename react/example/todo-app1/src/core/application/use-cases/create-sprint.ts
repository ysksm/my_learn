import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { Sprint } from '../../domain/models/sprint';
import { CreateSprintDTO } from '../dtos/sprint-dtos';

export class CreateSprintUseCase {
  constructor(private sprintRepository: SprintRepository) {}

  /**
   * Create a new sprint
   * @param dto Sprint creation data
   * @returns ID of the created sprint
   */
  async execute(dto: CreateSprintDTO): Promise<string> {
    // Validate dates
    if (dto.startDate >= dto.endDate) {
      throw new Error('Start date must be before end date');
    }
    
    // Create the sprint
    const sprint = Sprint.create({
      name: dto.name,
      goal: dto.goal,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: dto.status,
      tickets: []
    });
    
    // Save the sprint
    await this.sprintRepository.save(sprint);
    
    return sprint.id;
  }
}

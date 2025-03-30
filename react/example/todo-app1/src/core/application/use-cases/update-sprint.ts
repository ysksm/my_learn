import { SprintRepository } from '../../domain/repositories/sprint-repository';
import { UpdateSprintDTO } from '../dtos/sprint-dtos';

export class UpdateSprintUseCase {
  constructor(private sprintRepository: SprintRepository) {}

  /**
   * Update an existing sprint
   * @param dto Sprint update data
   * @returns true if successful, false if sprint not found
   */
  async execute(dto: UpdateSprintDTO): Promise<boolean> {
    // Get the sprint
    const sprint = await this.sprintRepository.findById(dto.id);
    if (!sprint) return false;
    
    // Update sprint properties
    if (dto.name !== undefined) {
      sprint.updateName(dto.name);
    }
    
    if (dto.goal !== undefined) {
      sprint.updateGoal(dto.goal);
    }
    
    if (dto.status !== undefined) {
      sprint.updateStatus(dto.status);
    }
    
    // Update dates if both are provided
    if (dto.startDate !== undefined && dto.endDate !== undefined) {
      sprint.updateDates(dto.startDate, dto.endDate);
    } else if (dto.startDate !== undefined) {
      sprint.updateDates(dto.startDate, sprint.endDate);
    } else if (dto.endDate !== undefined) {
      sprint.updateDates(sprint.startDate, dto.endDate);
    }
    
    // Save the updated sprint
    await this.sprintRepository.save(sprint);
    
    return true;
  }
}

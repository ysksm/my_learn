import { Sprint } from '../../domain/models/sprint';
import { SprintRepository, SprintFilter } from '../../domain/repositories/sprint-repository';
import { StorageAdapter } from '../storage/storage-adapter';

export class StorageSprintRepository implements SprintRepository {
  private readonly SPRINT_KEY_PREFIX = 'sprint:';
  
  constructor(private storageAdapter: StorageAdapter) {}

  async findById(id: string): Promise<Sprint | null> {
    const data = await this.storageAdapter.getItem<any>(`${this.SPRINT_KEY_PREFIX}${id}`);
    return data ? this.mapToSprint(data) : null;
  }

  async findAll(filter?: SprintFilter): Promise<Sprint[]> {
    const allSprints = await this.storageAdapter.getAllItems<any>(this.SPRINT_KEY_PREFIX);
    const sprints = allSprints.map(data => this.mapToSprint(data));
    
    if (!filter) return sprints;
    
    return sprints.filter(sprint => {
      let matches = true;
      
      if (filter.status?.length && !filter.status.includes(sprint.status)) {
        matches = false;
      }
      
      if (filter.startDateFrom && sprint.startDate < filter.startDateFrom) {
        matches = false;
      }
      
      if (filter.startDateTo && sprint.startDate > filter.startDateTo) {
        matches = false;
      }
      
      if (filter.endDateFrom && sprint.endDate < filter.endDateFrom) {
        matches = false;
      }
      
      if (filter.endDateTo && sprint.endDate > filter.endDateTo) {
        matches = false;
      }
      
      if (filter.searchText) {
        const searchText = filter.searchText.toLowerCase();
        const nameMatches = sprint.name.toLowerCase().includes(searchText);
        const goalMatches = sprint.goal.toLowerCase().includes(searchText);
        if (!nameMatches && !goalMatches) {
          matches = false;
        }
      }
      
      return matches;
    });
  }

  async save(sprint: Sprint): Promise<void> {
    const data = this.mapFromSprint(sprint);
    await this.storageAdapter.setItem(`${this.SPRINT_KEY_PREFIX}${sprint.id}`, data);
  }

  async remove(id: string): Promise<void> {
    await this.storageAdapter.removeItem(`${this.SPRINT_KEY_PREFIX}${id}`);
  }

  async addTicketToSprint(sprintId: string, ticketId: string): Promise<void> {
    const sprint = await this.findById(sprintId);
    if (!sprint) {
      throw new Error(`Sprint with id ${sprintId} not found`);
    }
    
    sprint.addTicket(ticketId);
    await this.save(sprint);
  }

  async removeTicketFromSprint(sprintId: string, ticketId: string): Promise<void> {
    const sprint = await this.findById(sprintId);
    if (!sprint) {
      throw new Error(`Sprint with id ${sprintId} not found`);
    }
    
    sprint.removeTicket(ticketId);
    await this.save(sprint);
  }

  private mapToSprint(data: any): Sprint {
    return new Sprint({
      name: data.name,
      goal: data.goal,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: data.status,
      tickets: data.tickets || []
    }, data.id);
  }

  private mapFromSprint(sprint: Sprint): any {
    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      endDate: sprint.endDate.toISOString(),
      status: sprint.status,
      tickets: sprint.tickets
    };
  }
}

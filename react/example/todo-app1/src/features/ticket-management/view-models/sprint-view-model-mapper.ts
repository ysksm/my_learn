import { Sprint } from '../../../core/domain/models/sprint';
import { Ticket } from '../../../core/domain/models/ticket';
import { SprintListItemViewModel, SprintDetailsViewModel, SprintViewModelHelpers } from './sprint-view-model';
import { TicketViewModelHelpers } from './ticket-view-model';

/**
 * Mapper for converting domain sprint models to view models
 */
export class SprintViewModelMapper {
  /**
   * Map a domain sprint to a list item view model
   * @param sprint Domain sprint model
   * @param tickets Optional tickets in the sprint
   * @returns Sprint list item view model
   */
  mapToListItem(sprint: Sprint, tickets: Ticket[] = []): SprintListItemViewModel {
    const completedTickets = tickets.filter(ticket => ticket.status === 'DONE');
    const progress = SprintViewModelHelpers.calculateProgress(completedTickets.length, tickets.length);

    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      startDateFormatted: SprintViewModelHelpers.formatDate(sprint.startDate.toISOString()),
      endDate: sprint.endDate.toISOString(),
      endDateFormatted: SprintViewModelHelpers.formatDate(sprint.endDate.toISOString()),
      status: sprint.status,
      statusLabel: SprintViewModelHelpers.getStatusLabel(sprint.status),
      statusColor: SprintViewModelHelpers.getStatusColor(sprint.status),
      ticketCount: tickets.length,
      progress
    };
  }

  /**
   * Map a domain sprint to a details view model
   * @param sprint Domain sprint model
   * @param tickets Optional tickets in the sprint
   * @returns Sprint details view model
   */
  mapToDetails(sprint: Sprint, tickets: Ticket[] = []): SprintDetailsViewModel {
    const completedTickets = tickets.filter(ticket => ticket.status === 'DONE');
    const progress = SprintViewModelHelpers.calculateProgress(completedTickets.length, tickets.length);
    const daysLeft = SprintViewModelHelpers.calculateDaysLeft(sprint.endDate.toISOString());
    const isActive = SprintViewModelHelpers.isActive(
      sprint.startDate.toISOString(),
      sprint.endDate.toISOString()
    );

    return {
      id: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.startDate.toISOString(),
      startDateFormatted: SprintViewModelHelpers.formatDate(sprint.startDate.toISOString()),
      endDate: sprint.endDate.toISOString(),
      endDateFormatted: SprintViewModelHelpers.formatDate(sprint.endDate.toISOString()),
      status: sprint.status,
      statusLabel: SprintViewModelHelpers.getStatusLabel(sprint.status),
      statusColor: SprintViewModelHelpers.getStatusColor(sprint.status),
      tickets: tickets.map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        statusLabel: TicketViewModelHelpers.getStatusLabel(ticket.status),
        priority: ticket.priority,
        priorityLabel: TicketViewModelHelpers.getPriorityLabel(ticket.priority),
        type: ticket.type,
        typeLabel: TicketViewModelHelpers.getTypeLabel(ticket.type)
      })),
      ticketCount: tickets.length,
      completedTicketCount: completedTickets.length,
      progress,
      daysLeft,
      isActive
    };
  }
}

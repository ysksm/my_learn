import { Ticket } from '../../../core/domain/models/ticket';
import { TicketListItemViewModel, TicketDetailsViewModel, TicketViewModelHelpers } from './ticket-view-model';

/**
 * Mapper for converting domain ticket models to view models
 */
export class TicketViewModelMapper {
  /**
   * Map a domain ticket to a list item view model
   * @param ticket Domain ticket model
   * @returns Ticket list item view model
   */
  mapToListItem(ticket: Ticket): TicketListItemViewModel {
    return {
      id: ticket.id,
      title: ticket.title,
      type: ticket.type,
      typeLabel: TicketViewModelHelpers.getTypeLabel(ticket.type),
      status: ticket.status,
      statusLabel: TicketViewModelHelpers.getStatusLabel(ticket.status),
      priority: ticket.priority,
      priorityLabel: TicketViewModelHelpers.getPriorityLabel(ticket.priority),
      priorityColor: TicketViewModelHelpers.getPriorityColor(ticket.priority),
      severity: ticket.severity,
      severityLabel: TicketViewModelHelpers.getSeverityLabel(ticket.severity),
      tags: ticket.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })),
      assignee: ticket.assigneeId ? `User ${ticket.assigneeId}` : undefined,
      dueDate: ticket.dueDate?.toISOString(),
      dueDateFormatted: ticket.dueDate ? TicketViewModelHelpers.formatDate(ticket.dueDate.toISOString()) : undefined,
      isOverdue: ticket.dueDate ? TicketViewModelHelpers.isOverdue(ticket.dueDate.toISOString()) : false
    };
  }

  /**
   * Map a domain ticket to a details view model
   * @param ticket Domain ticket model
   * @param parent Optional parent ticket
   * @param children Optional children tickets
   * @param sprint Optional sprint
   * @returns Ticket details view model
   */
  mapToDetails(
    ticket: Ticket,
    parent?: Ticket | null,
    children?: Ticket[],
    sprint?: { id: string; name: string } | null
  ): TicketDetailsViewModel {
    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      typeLabel: TicketViewModelHelpers.getTypeLabel(ticket.type),
      status: ticket.status,
      statusLabel: TicketViewModelHelpers.getStatusLabel(ticket.status),
      priority: ticket.priority,
      priorityLabel: TicketViewModelHelpers.getPriorityLabel(ticket.priority),
      priorityColor: TicketViewModelHelpers.getPriorityColor(ticket.priority),
      severity: ticket.severity,
      severityLabel: TicketViewModelHelpers.getSeverityLabel(ticket.severity),
      tags: ticket.tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
      })),
      assignee: ticket.assigneeId ? {
        id: ticket.assigneeId,
        name: `User ${ticket.assigneeId}`
      } : undefined,
      reporter: {
        id: ticket.reporterId,
        name: `User ${ticket.reporterId}`
      },
      createdAt: ticket.createdAt.toISOString(),
      createdAtFormatted: TicketViewModelHelpers.formatDate(ticket.createdAt.toISOString()) || '',
      updatedAt: ticket.updatedAt.toISOString(),
      updatedAtFormatted: TicketViewModelHelpers.formatDate(ticket.updatedAt.toISOString()) || '',
      dueDate: ticket.dueDate?.toISOString(),
      dueDateFormatted: ticket.dueDate ? TicketViewModelHelpers.formatDate(ticket.dueDate.toISOString()) : undefined,
      isOverdue: ticket.dueDate ? TicketViewModelHelpers.isOverdue(ticket.dueDate.toISOString()) : false,
      estimatedHours: ticket.estimatedHours,
      sprint: sprint || undefined,
      parent: parent ? {
        id: parent.id,
        title: parent.title
      } : undefined,
      children: children?.map(child => ({
        id: child.id,
        title: child.title,
        status: child.status,
        statusLabel: TicketViewModelHelpers.getStatusLabel(child.status)
      }))
    };
  }
}

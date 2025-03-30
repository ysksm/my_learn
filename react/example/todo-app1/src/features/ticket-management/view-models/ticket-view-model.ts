import { TicketType, Priority, Severity, Status } from '../../../core/domain/types';

/**
 * View model for ticket list item
 */
export interface TicketListItemViewModel {
  id: string;
  title: string;
  type: TicketType;
  typeLabel: string;
  status: Status;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  priorityColor: string;
  severity: Severity;
  severityLabel: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  assignee?: string;
  dueDate?: string;
  dueDateFormatted?: string;
  isOverdue?: boolean;
}

/**
 * View model for ticket details
 */
export interface TicketDetailsViewModel {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  typeLabel: string;
  status: Status;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  priorityColor: string;
  severity: Severity;
  severityLabel: string;
  tags: {
    id: string;
    name: string;
    color: string;
  }[];
  assignee?: {
    id: string;
    name: string;
  };
  reporter: {
    id: string;
    name: string;
  };
  createdAt: string;
  createdAtFormatted: string;
  updatedAt: string;
  updatedAtFormatted: string;
  dueDate?: string;
  dueDateFormatted?: string;
  isOverdue?: boolean;
  estimatedHours?: number;
  sprint?: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    title: string;
  };
  children?: {
    id: string;
    title: string;
    status: Status;
    statusLabel: string;
  }[];
}

/**
 * Helper functions for ticket view models
 */
export const TicketViewModelHelpers = {
  getTypeLabel(type: TicketType): string {
    switch (type) {
      case 'USER_STORY':
        return 'ユーザーストーリー';
      case 'TODO':
        return 'TODO';
      case 'BUG':
        return 'バグ';
      case 'EPIC':
        return 'エピック';
      case 'FEATURE':
        return '機能';
      default:
        return type;
    }
  },

  getStatusLabel(status: Status): string {
    switch (status) {
      case 'BACKLOG':
        return 'バックログ';
      case 'TODO':
        return 'TODO';
      case 'IN_PROGRESS':
        return '進行中';
      case 'IN_REVIEW':
        return 'レビュー中';
      case 'DONE':
        return '完了';
      default:
        return status;
    }
  },

  getPriorityLabel(priority: Priority): string {
    switch (priority) {
      case 'CRITICAL':
        return '最重要';
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return priority;
    }
  },

  getPriorityColor(priority: Priority): string {
    switch (priority) {
      case 'CRITICAL':
        return '#ff5630';
      case 'HIGH':
        return '#ff8b00';
      case 'MEDIUM':
        return '#ffab00';
      case 'LOW':
        return '#36b37e';
      default:
        return '#6b778c';
    }
  },

  getSeverityLabel(severity: Severity): string {
    switch (severity) {
      case 'BLOCKER':
        return 'ブロッカー';
      case 'MAJOR':
        return '重大';
      case 'NORMAL':
        return '通常';
      case 'MINOR':
        return '軽微';
      case 'TRIVIAL':
        return '些細';
      default:
        return severity;
    }
  },

  formatDate(dateString?: string): string | undefined {
    if (!dateString) return undefined;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  isOverdue(dateString?: string): boolean {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  }
};

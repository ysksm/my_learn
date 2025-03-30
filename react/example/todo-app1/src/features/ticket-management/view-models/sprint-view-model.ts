import { SprintStatus } from '../../../core/domain/types';

/**
 * View model for sprint list item
 */
export interface SprintListItemViewModel {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  startDateFormatted: string;
  endDate: string;
  endDateFormatted: string;
  status: SprintStatus;
  statusLabel: string;
  statusColor: string;
  ticketCount: number;
  progress: number; // Percentage of completed tickets
}

/**
 * View model for sprint details
 */
export interface SprintDetailsViewModel {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  startDateFormatted: string;
  endDate: string;
  endDateFormatted: string;
  status: SprintStatus;
  statusLabel: string;
  statusColor: string;
  tickets: {
    id: string;
    title: string;
    status: string;
    statusLabel: string;
    priority: string;
    priorityLabel: string;
    type: string;
    typeLabel: string;
  }[];
  ticketCount: number;
  completedTicketCount: number;
  progress: number; // Percentage of completed tickets
  daysLeft: number;
  isActive: boolean;
}

/**
 * Helper functions for sprint view models
 */
export const SprintViewModelHelpers = {
  getStatusLabel(status: SprintStatus): string {
    switch (status) {
      case 'PLANNING':
        return '計画中';
      case 'ACTIVE':
        return '進行中';
      case 'COMPLETED':
        return '完了';
      default:
        return status;
    }
  },

  getStatusColor(status: SprintStatus): string {
    switch (status) {
      case 'PLANNING':
        return '#6b778c';
      case 'ACTIVE':
        return '#0052cc';
      case 'COMPLETED':
        return '#36b37e';
      default:
        return '#6b778c';
    }
  },

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  calculateDaysLeft(endDateString: string): number {
    const endDate = new Date(endDateString);
    const today = new Date();
    
    // Set both dates to midnight for accurate day calculation
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    // Calculate the difference in milliseconds
    const diffMs = endDate.getTime() - today.getTime();
    
    // Convert to days
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  isActive(startDateString: string, endDateString: string): boolean {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const today = new Date();
    
    // Set all dates to midnight for accurate comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    return today >= startDate && today <= endDate;
  },

  calculateProgress(completedTickets: number, totalTickets: number): number {
    if (totalTickets === 0) return 0;
    return Math.round((completedTickets / totalTickets) * 100);
  }
};

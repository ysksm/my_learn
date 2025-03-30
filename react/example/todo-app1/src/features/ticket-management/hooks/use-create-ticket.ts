import { useState, useCallback } from 'react';
import { createTicketUseCase } from '../../../core/di-container';
import { CreateTicketDTO } from '../../../core/application/dtos/ticket-dtos';
import { TicketType, Priority, Severity, Status, Statuses } from '../../../core/domain/types';

/**
 * Default values for a new ticket
 */
const defaultTicketValues: Omit<CreateTicketDTO, 'title' | 'description' | 'reporterId'> = {
  type: 'TODO',
  status: 'BACKLOG',
  priority: 'MEDIUM',
  severity: 'NORMAL',
  tagIds: []
};

/**
 * Hook for creating a new ticket
 */
export function useCreateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCallback(async (
    ticketData: Partial<CreateTicketDTO> & { title: string; description: string; reporterId: string }
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Merge default values with provided data
      const ticketToCreate: CreateTicketDTO = {
        ...defaultTicketValues,
        ...ticketData
      };
      
      const ticketId = await createTicketUseCase.execute(ticketToCreate);
      return ticketId;
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('チケットの作成に失敗しました。');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createTicket
  };
}

/**
 * Get available ticket types with labels
 */
export function getTicketTypeOptions() {
  return [
    { value: 'USER_STORY' as TicketType, label: 'ユーザーストーリー' },
    { value: 'TODO' as TicketType, label: 'TODO' },
    { value: 'BUG' as TicketType, label: 'バグ' },
    { value: 'EPIC' as TicketType, label: 'エピック' },
    { value: 'FEATURE' as TicketType, label: '機能' }
  ];
}

/**
 * Get available priority options with labels
 */
export function getPriorityOptions() {
  return [
    { value: 'CRITICAL' as Priority, label: '最重要' },
    { value: 'HIGH' as Priority, label: '高' },
    { value: 'MEDIUM' as Priority, label: '中' },
    { value: 'LOW' as Priority, label: '低' }
  ];
}

/**
 * Get available severity options with labels
 */
export function getSeverityOptions() {
  return [
    { value: 'BLOCKER' as Severity, label: 'ブロッカー' },
    { value: 'MAJOR' as Severity, label: '重大' },
    { value: 'NORMAL' as Severity, label: '通常' },
    { value: 'MINOR' as Severity, label: '軽微' },
    { value: 'TRIVIAL' as Severity, label: '些細' }
  ];
}

/**
 * Get available status options with labels
 */
export function getStatusOptions() {
  return [
    { value: Statuses.BACKLOG, label: 'バックログ' },
    { value: Statuses.TODO, label: 'TODO' },
    { value: Statuses.IN_PROGRESS, label: '進行中' },
    { value: Statuses.IN_REVIEW, label: 'レビュー中' },
    { value: Statuses.DONE, label: '完了' }
  ];
}

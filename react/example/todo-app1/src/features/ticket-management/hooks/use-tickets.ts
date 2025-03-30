import { useState, useEffect, useCallback } from 'react';
import { TicketFilter } from '../../../core/domain/repositories/ticket-repository';
import { getTicketsUseCase } from '../../../core/di-container';
import { TicketListItemViewModel } from '../view-models/ticket-view-model';
import { TicketViewModelMapper } from '../view-models/ticket-view-model-mapper';

/**
 * Hook for managing tickets
 */
export function useTickets(initialFilter: TicketFilter = {}) {
  const [tickets, setTickets] = useState<TicketListItemViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketFilter>(initialFilter);
  
  const ticketViewModelMapper = new TicketViewModelMapper();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const domainTickets = await getTicketsUseCase.execute(filter);
      const viewModels = domainTickets.map(ticket => 
        ticketViewModelMapper.mapToListItem(ticket)
      );
      setTickets(viewModels);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('チケットの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateFilter = useCallback((newFilter: Partial<TicketFilter>) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
  }, []);

  return {
    tickets,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    refreshTickets: fetchTickets
  };
}

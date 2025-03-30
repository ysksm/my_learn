import { useState, useEffect, useCallback } from 'react';
import { getTicketByIdUseCase, updateTicketUseCase, deleteTicketUseCase } from '../../../core/di-container';
import { TicketDetailsViewModel } from '../view-models/ticket-view-model';
import { TicketViewModelMapper } from '../view-models/ticket-view-model-mapper';
import { UpdateTicketDTO } from '../../../core/application/dtos/ticket-dtos';

/**
 * Hook for managing ticket details
 */
export function useTicketDetail(ticketId: string) {
  const [ticket, setTicket] = useState<TicketDetailsViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const ticketViewModelMapper = new TicketViewModelMapper();

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ticketDetails = await getTicketByIdUseCase.executeDTO(ticketId);
      if (ticketDetails) {
        setTicket(ticketDetails as unknown as TicketDetailsViewModel);
      } else {
        setError('チケットが見つかりませんでした。');
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
      setError('チケットの詳細取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const updateTicket = useCallback(async (updateData: Partial<UpdateTicketDTO>) => {
    if (!ticketId) return false;
    
    setUpdating(true);
    setError(null);
    
    try {
      const success = await updateTicketUseCase.execute({
        id: ticketId,
        ...updateData
      });
      
      if (success) {
        await fetchTicket();
        return true;
      } else {
        setError('チケットの更新に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      setError('チケットの更新に失敗しました。');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [ticketId, fetchTicket]);

  const deleteTicket = useCallback(async () => {
    if (!ticketId) return false;
    
    setDeleting(true);
    setError(null);
    
    try {
      const success = await deleteTicketUseCase.execute(ticketId);
      
      if (success) {
        return true;
      } else {
        setError('チケットの削除に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error deleting ticket:', err);
      setError('チケットの削除に失敗しました。');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [ticketId]);

  return {
    ticket,
    loading,
    updating,
    deleting,
    error,
    refreshTicket: fetchTicket,
    updateTicket,
    deleteTicket
  };
}

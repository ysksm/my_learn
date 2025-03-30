import { useState, useEffect, useCallback } from 'react';
import { 
  getSprintByIdUseCase, 
  getTicketsUseCase, 
  updateSprintUseCase, 
  deleteSprintUseCase,
  addTicketToSprintUseCase,
  removeTicketFromSprintUseCase
} from '../../../core/di-container';
import { SprintDetailsViewModel } from '../view-models/sprint-view-model';
import { SprintViewModelMapper } from '../view-models/sprint-view-model-mapper';
import { UpdateSprintDTO } from '../../../core/application/dtos/sprint-dtos';

/**
 * Hook for managing sprint details
 */
export function useSprintDetail(sprintId: string) {
  const [sprint, setSprint] = useState<SprintDetailsViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingTicket, setAddingTicket] = useState(false);
  const [removingTicket, setRemovingTicket] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sprintViewModelMapper = new SprintViewModelMapper();

  const fetchSprint = useCallback(async () => {
    if (!sprintId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the sprint
      const domainSprint = await getSprintByIdUseCase.execute(sprintId);
      
      if (!domainSprint) {
        setError('スプリントが見つかりませんでした。');
        return;
      }
      
      // Get the tickets for this sprint
      const tickets = await getTicketsUseCase.execute({ sprintId });
      
      // Map to view model
      const sprintViewModel = sprintViewModelMapper.mapToDetails(domainSprint, tickets);
      setSprint(sprintViewModel);
    } catch (err) {
      console.error('Error fetching sprint details:', err);
      setError('スプリントの詳細取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [sprintId]);

  useEffect(() => {
    fetchSprint();
  }, [fetchSprint]);

  const updateSprint = useCallback(async (updateData: Partial<UpdateSprintDTO>): Promise<boolean> => {
    if (!sprintId) return false;
    
    setUpdating(true);
    setError(null);
    
    try {
      const success = await updateSprintUseCase.execute({
        id: sprintId,
        ...updateData
      });
      
      if (success) {
        await fetchSprint();
        return true;
      } else {
        setError('スプリントの更新に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error updating sprint:', err);
      setError('スプリントの更新に失敗しました。');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [sprintId, fetchSprint]);

  const deleteSprint = useCallback(async (): Promise<boolean> => {
    if (!sprintId) return false;
    
    setDeleting(true);
    setError(null);
    
    try {
      const success = await deleteSprintUseCase.execute(sprintId);
      
      if (success) {
        return true;
      } else {
        setError('スプリントの削除に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error deleting sprint:', err);
      setError('スプリントの削除に失敗しました。');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [sprintId]);

  const addTicketToSprint = useCallback(async (ticketId: string): Promise<boolean> => {
    if (!sprintId) return false;
    
    setAddingTicket(true);
    setError(null);
    
    try {
      const success = await addTicketToSprintUseCase.execute(sprintId, ticketId);
      
      if (success) {
        await fetchSprint();
        return true;
      } else {
        setError('チケットの追加に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error adding ticket to sprint:', err);
      setError('チケットの追加に失敗しました。');
      return false;
    } finally {
      setAddingTicket(false);
    }
  }, [sprintId, fetchSprint]);

  const removeTicketFromSprint = useCallback(async (ticketId: string): Promise<boolean> => {
    if (!sprintId) return false;
    
    setRemovingTicket(true);
    setError(null);
    
    try {
      const success = await removeTicketFromSprintUseCase.execute(sprintId, ticketId);
      
      if (success) {
        await fetchSprint();
        return true;
      } else {
        setError('チケットの削除に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error removing ticket from sprint:', err);
      setError('チケットの削除に失敗しました。');
      return false;
    } finally {
      setRemovingTicket(false);
    }
  }, [sprintId, fetchSprint]);

  return {
    sprint,
    loading,
    updating,
    deleting,
    addingTicket,
    removingTicket,
    error,
    refreshSprint: fetchSprint,
    updateSprint,
    deleteSprint,
    addTicketToSprint,
    removeTicketFromSprint
  };
}

import { useState, useEffect, useCallback } from 'react';
import { SprintFilter } from '../../../core/domain/repositories/sprint-repository';
import { 
  getSprintsUseCase, 
  getTicketsUseCase, 
  createSprintUseCase, 
  updateSprintUseCase, 
  deleteSprintUseCase 
} from '../../../core/di-container';
import { SprintListItemViewModel } from '../view-models/sprint-view-model';
import { SprintViewModelMapper } from '../view-models/sprint-view-model-mapper';
import { CreateSprintDTO, UpdateSprintDTO } from '../../../core/application/dtos/sprint-dtos';

/**
 * Hook for managing sprints
 */
export function useSprints(initialFilter: SprintFilter = {}) {
  const [sprints, setSprints] = useState<SprintListItemViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SprintFilter>(initialFilter);
  
  const sprintViewModelMapper = new SprintViewModelMapper();

  const fetchSprints = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const domainSprints = await getSprintsUseCase.execute(filter);
      
      // For each sprint, get the tickets
      const sprintViewModels = await Promise.all(
        domainSprints.map(async (sprint) => {
          const tickets = await getTicketsUseCase.execute({ sprintId: sprint.id });
          return sprintViewModelMapper.mapToListItem(sprint, tickets);
        })
      );
      
      setSprints(sprintViewModels);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setError('スプリントの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  const createSprint = useCallback(async (sprintData: CreateSprintDTO): Promise<string | null> => {
    setCreating(true);
    setError(null);
    
    try {
      const sprintId = await createSprintUseCase.execute(sprintData);
      await fetchSprints();
      return sprintId;
    } catch (err) {
      console.error('Error creating sprint:', err);
      setError('スプリントの作成に失敗しました。');
      return null;
    } finally {
      setCreating(false);
    }
  }, [fetchSprints]);

  const updateSprint = useCallback(async (sprintData: UpdateSprintDTO): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const success = await updateSprintUseCase.execute(sprintData);
      
      if (success) {
        await fetchSprints();
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
  }, [fetchSprints]);

  const deleteSprint = useCallback(async (sprintId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    
    try {
      const success = await deleteSprintUseCase.execute(sprintId);
      
      if (success) {
        await fetchSprints();
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
  }, [fetchSprints]);

  const updateFilter = useCallback((newFilter: Partial<SprintFilter>) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  }, []);

  return {
    sprints,
    loading,
    creating,
    updating,
    deleting,
    error,
    filter,
    updateFilter,
    refreshSprints: fetchSprints,
    createSprint,
    updateSprint,
    deleteSprint
  };
}

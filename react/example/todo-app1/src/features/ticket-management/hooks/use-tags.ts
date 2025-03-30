import { useState, useEffect, useCallback } from 'react';
import { TagFilter } from '../../../core/domain/repositories/tag-repository';
import { getTagsUseCase, createTagUseCase, updateTagUseCase, deleteTagUseCase } from '../../../core/di-container';
import { TagViewModel } from '../view-models/tag-view-model';
import { TagViewModelMapper } from '../view-models/tag-view-model-mapper';
import { CreateTagDTO, UpdateTagDTO } from '../../../core/application/dtos/tag-dtos';

/**
 * Hook for managing tags
 */
export function useTags(initialFilter: TagFilter = {}) {
  const [tags, setTags] = useState<TagViewModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TagFilter>(initialFilter);
  
  const tagViewModelMapper = new TagViewModelMapper();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const domainTags = await getTagsUseCase.execute(filter);
      const viewModels = tagViewModelMapper.mapToViewModels(domainTags);
      setTags(viewModels);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('タグの取得に失敗しました。');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (tagData: CreateTagDTO): Promise<string | null> => {
    setCreating(true);
    setError(null);
    
    try {
      const tagId = await createTagUseCase.execute(tagData);
      await fetchTags();
      return tagId;
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('タグの作成に失敗しました。');
      return null;
    } finally {
      setCreating(false);
    }
  }, [fetchTags]);

  const updateTag = useCallback(async (tagData: UpdateTagDTO): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    
    try {
      const success = await updateTagUseCase.execute(tagData);
      
      if (success) {
        await fetchTags();
        return true;
      } else {
        setError('タグの更新に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error updating tag:', err);
      setError('タグの更新に失敗しました。');
      return false;
    } finally {
      setUpdating(false);
    }
  }, [fetchTags]);

  const deleteTag = useCallback(async (tagId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    
    try {
      const success = await deleteTagUseCase.execute(tagId);
      
      if (success) {
        await fetchTags();
        return true;
      } else {
        setError('タグの削除に失敗しました。');
        return false;
      }
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('タグの削除に失敗しました。');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [fetchTags]);

  const updateFilter = useCallback((newFilter: Partial<TagFilter>) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  }, []);

  return {
    tags,
    loading,
    creating,
    updating,
    deleting,
    error,
    filter,
    updateFilter,
    refreshTags: fetchTags,
    createTag,
    updateTag,
    deleteTag
  };
}

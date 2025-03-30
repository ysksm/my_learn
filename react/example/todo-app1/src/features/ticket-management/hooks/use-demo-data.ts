import { useState, useEffect, useCallback } from 'react';
import { initializeDemoData } from '../../../core/di-container';

/**
 * Hook for initializing demo data
 */
export function useDemoData() {
  const [initializing, setInitializing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    setInitializing(true);
    setError(null);
    
    try {
      await initializeDemoData();
      setInitialized(true);
    } catch (err) {
      console.error('Error initializing demo data:', err);
      setError('デモデータの初期化に失敗しました。');
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    initializing,
    initialized,
    error,
    reinitialize: initialize
  };
}

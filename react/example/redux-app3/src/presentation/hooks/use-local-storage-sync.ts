import { useEffect } from 'react';
import { useAppDispatch } from '../../application/store/hooks';
import { fetchAccounts } from '../../application/store/slices/account-slice';
import { fetchProducts } from '../../application/store/slices/product-slice';
import { fetchOpportunities } from '../../application/store/slices/opportunity-slice';
import { fetchActivities } from '../../application/store/slices/activity-slice';

/**
 * LocalStorageの変更を検知して、Reduxストアを更新するカスタムフック
 * 他のタブでの変更を反映させるために使用する
 */
export const useLocalStorageSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // LocalStorageの変更イベントをリッスン
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) return;

      // 変更されたキーに応じて、対応するデータを再取得
      if (event.key === 'crm_accounts') {
        dispatch(fetchAccounts());
      } else if (event.key === 'crm_products') {
        dispatch(fetchProducts());
      } else if (event.key === 'crm_opportunities') {
        dispatch(fetchOpportunities());
      } else if (event.key === 'crm_activities') {
        dispatch(fetchActivities());
      }
    };

    // イベントリスナーを登録
    window.addEventListener('storage', handleStorageChange);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch]);
};

import { configureStore } from '@reduxjs/toolkit';
import { 
  accountReducer, 
  productReducer, 
  opportunityReducer, 
  activityReducer 
} from './slices';

// ストアの作成
export const store = configureStore({
  reducer: {
    accounts: accountReducer,
    products: productReducer,
    opportunities: opportunityReducer,
    activities: activityReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // LocalStorageイベントなどの非シリアライズ可能な値を許可
    }),
});

// ストアの型定義
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

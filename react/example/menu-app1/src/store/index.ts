import { configureStore } from '@reduxjs/toolkit';
import settingReducer from './slices/settingSlice';
import operationReducer from './slices/operationSlice';

export const store = configureStore({
  reducer: {
    setting: settingReducer,
    operation: operationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

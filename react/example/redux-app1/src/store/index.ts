import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import modelReducer from './slices/modelSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    model: modelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './slices/todoSlice';

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Todoクラスインスタンスと Date オブジェクトを許可
        ignoredActions: [
          'todo/fetchTodos/fulfilled',
          'todo/updateTodoStatus/fulfilled',
          'todo/updateTodoAssignee/fulfilled',
        ],
        ignoredPaths: ['todo.todos', 'todo.lastUpdated'],
      },
    }),
});

// TypeScript用の型定義
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

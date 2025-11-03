import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Todo } from '../../../domain/models/Todo';
import type { TodoStatus } from '../../../domain/models/TodoStatus';
import type { Assignee } from '../../../domain/models/Assignee';
import { GetTodosUseCase } from '../../../application/usecases/GetTodosUseCase';
import { UpdateTodoStatusUseCase } from '../../../application/usecases/UpdateTodoStatusUseCase';
import { UpdateTodoAssigneeUseCase } from '../../../application/usecases/UpdateTodoAssigneeUseCase';
import { container } from '../../../application/di/container';

// State の型定義
interface TodoState {
  todos: Todo[];
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

// 初期状態
const initialState: TodoState = {
  todos: [],
  loading: true,
  lastUpdated: null,
  error: null,
};

// Thunks（非同期アクション）

/**
 * Todo一覧を取得するThunk
 */
export const fetchTodos = createAsyncThunk('todo/fetchTodos', async () => {
  console.log('[Redux Thunk] fetchTodos開始');
  const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
  const todos = await getTodosUseCase.execute();
  console.log('[Redux Thunk] fetchTodos完了:', todos.length, '件');
  return todos;
});

/**
 * Todoの状態を更新するThunk
 */
export const updateTodoStatus = createAsyncThunk(
  'todo/updateTodoStatus',
  async ({ todoId, newStatus }: { todoId: string; newStatus: TodoStatus }) => {
    console.log('[Redux Thunk] updateTodoStatus開始:', { todoId, newStatus });
    const updateStatusUseCase = new UpdateTodoStatusUseCase(container.getTodoRepository());
    await updateStatusUseCase.execute(todoId, newStatus);

    // 更新後に最新データを取得して返す
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    const todos = await getTodosUseCase.execute();
    console.log('[Redux Thunk] updateTodoStatus完了、最新データ取得');
    return todos;
  }
);

/**
 * Todoの担当者を更新するThunk
 */
export const updateTodoAssignee = createAsyncThunk(
  'todo/updateTodoAssignee',
  async ({ todoId, newAssignee }: { todoId: string; newAssignee: Assignee | null }) => {
    console.log('[Redux Thunk] updateTodoAssignee開始:', { todoId, newAssignee: newAssignee?.name });
    const updateAssigneeUseCase = new UpdateTodoAssigneeUseCase(container.getTodoRepository());
    await updateAssigneeUseCase.execute(todoId, newAssignee);

    // 更新後に最新データを取得して返す
    const getTodosUseCase = new GetTodosUseCase(container.getTodoRepository());
    const todos = await getTodosUseCase.execute();
    console.log('[Redux Thunk] updateTodoAssignee完了、最新データ取得');
    return todos;
  }
);

// Slice
const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    // 同期アクション（必要に応じて追加）
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchTodos
    builder
      .addCase(fetchTodos.pending, (state) => {
        // 初回のみloadingをtrueに（ポーリング時はfalseのまま）
        if (state.todos.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.loading = false;
        state.todos = action.payload;
        state.lastUpdated = new Date();
        state.error = null;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Todoの取得に失敗しました';
        console.error('[Redux] fetchTodos失敗:', action.error);
      });

    // updateTodoStatus
    builder
      .addCase(updateTodoStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodoStatus.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.todos = action.payload;
        state.lastUpdated = new Date();
        state.error = null;
      })
      .addCase(updateTodoStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Todoの状態更新に失敗しました';
        console.error('[Redux] updateTodoStatus失敗:', action.error);
      });

    // updateTodoAssignee
    builder
      .addCase(updateTodoAssignee.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTodoAssignee.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.todos = action.payload;
        state.lastUpdated = new Date();
        state.error = null;
      })
      .addCase(updateTodoAssignee.rejected, (state, action) => {
        state.error = action.error.message || 'Todoの担当者更新に失敗しました';
        console.error('[Redux] updateTodoAssignee失敗:', action.error);
      });
  },
});

// Actions
export const { clearError } = todoSlice.actions;

// Selectors
export const selectTodos = (state: { todo: TodoState }) => state.todo.todos;
export const selectLoading = (state: { todo: TodoState }) => state.todo.loading;
export const selectLastUpdated = (state: { todo: TodoState }) => state.todo.lastUpdated;
export const selectError = (state: { todo: TodoState }) => state.todo.error;

// Reducer
export default todoSlice.reducer;

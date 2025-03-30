import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OperationState {
  value: number;
}

const initialState: OperationState = {
  value: 0,
};

export const operationSlice = createSlice({
  name: 'operation',
  initialState,
  reducers: {
    create: (state) => {
      state.value += 1;
    },
    read: (state) => {
      state.value -= 1;
    },
    update: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { create, read, update } = operationSlice.actions;
export default operationSlice.reducer;
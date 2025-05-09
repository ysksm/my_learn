import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  value: number;
}

const initialState: AccountState = {
  value: 0,
};

export const accountSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = accountSlice.actions;
export default accountSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingState {
  value: number;
}

const initialState: SettingState = {
  value: 0,
};

export const settingSlice = createSlice({
  name: 'setting',
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

export const { create, read, update } = settingSlice.actions;
export default settingSlice.reducer;
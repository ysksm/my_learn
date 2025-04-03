import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ModelRoot, { Account } from '../../models';

interface ModelState {
    root: ModelRoot
}

const initialState: ModelState = {
    root: {
        accounts: []
    }
};

export const counterSlice = createSlice({
  name: 'model',
  initialState,
  reducers: {
    create: (state, name) => {
      const newModel: Account=   {
        id: 1,
        name: name.payload
    }
    state.root.accounts.push(newModel);
  },
}});

export const { create } = counterSlice.actions;
export default counterSlice.reducer;
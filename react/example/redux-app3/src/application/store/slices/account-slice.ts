import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, CreateAccountDTO, UpdateAccountDTO, createAccount, updateAccount } from '../../../domain/model';
import { LocalStorageAccountRepository } from '../../../infrastructure/persistence';
import { ID } from '../../../types';

// リポジトリのインスタンスを作成
const accountRepository = new LocalStorageAccountRepository();

// 状態の型定義
interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
}

// 初期状態
const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
  error: null,
};

// 非同期アクション

// すべての取引先を取得
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async () => {
    return await accountRepository.findAll();
  }
);

// IDで取引先を取得
export const fetchAccountById = createAsyncThunk(
  'accounts/fetchById',
  async (id: ID) => {
    const account = await accountRepository.findById(id);
    if (!account) {
      throw new Error(`Account with ID ${id} not found`);
    }
    return account;
  }
);

// 取引先を作成
export const createAccountAsync = createAsyncThunk(
  'accounts/create',
  async (dto: CreateAccountDTO) => {
    const newAccount = createAccount(dto);
    return await accountRepository.save(newAccount);
  }
);

// 取引先を更新
export const updateAccountAsync = createAsyncThunk(
  'accounts/update',
  async (dto: UpdateAccountDTO) => {
    const account = await accountRepository.findById(dto.id);
    if (!account) {
      throw new Error(`Account with ID ${dto.id} not found`);
    }
    const updatedAccount = updateAccount(account, dto);
    return await accountRepository.save(updatedAccount);
  }
);

// 取引先を削除
export const deleteAccountAsync = createAsyncThunk(
  'accounts/delete',
  async (id: ID) => {
    const success = await accountRepository.deleteById(id);
    if (!success) {
      throw new Error(`Failed to delete account with ID ${id}`);
    }
    return id;
  }
);

// スライスの作成
const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // 選択中の取引先をクリア
    clearSelectedAccount: (state) => {
      state.selectedAccount = null;
    },
    // 取引先を選択
    selectAccount: (state, action: PayloadAction<Account>) => {
      state.selectedAccount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAccounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      
      // fetchAccountById
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAccount = action.payload;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch account';
      })
      
      // createAccountAsync
      .addCase(createAccountAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccountAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
        state.selectedAccount = action.payload;
      })
      .addCase(createAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create account';
      })
      
      // updateAccountAsync
      .addCase(updateAccountAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccountAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accounts.findIndex(account => account.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        state.selectedAccount = action.payload;
      })
      .addCase(updateAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update account';
      })
      
      // deleteAccountAsync
      .addCase(deleteAccountAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccountAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = state.accounts.filter(account => account.id !== action.payload);
        if (state.selectedAccount && state.selectedAccount.id === action.payload) {
          state.selectedAccount = null;
        }
      })
      .addCase(deleteAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete account';
      });
  },
});

// アクションをエクスポート
export const { clearSelectedAccount, selectAccount } = accountSlice.actions;

// リデューサーをエクスポート
export default accountSlice.reducer;

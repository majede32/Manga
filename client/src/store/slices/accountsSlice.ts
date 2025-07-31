import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountsService from '../../services/accountsService';

export interface Account {
  id: string;
  accountNumber: string;
  type: 'current' | 'savings' | 'business';
  balance: number;
  currency: 'TND' | 'USD' | 'EUR';
  isActive: boolean;
  createdAt: string;
  lastTransactionAt?: string;
  accountName: string;
  iban?: string;
  minimumBalance: number;
  interestRate?: number;
}

interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
  totalBalance: number;
}

const initialState: AccountsState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
  error: null,
  totalBalance: 0,
};

// Async thunks
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountsService.getAccounts();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: { type: Account['type']; accountName: string; initialDeposit?: number }, { rejectWithValue }) => {
    try {
      const response = await accountsService.createAccount(accountData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create account');
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ accountId, updates }: { accountId: string; updates: Partial<Account> }, { rejectWithValue }) => {
    try {
      const response = await accountsService.updateAccount(accountId, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update account');
    }
  }
);

export const closeAccount = createAsyncThunk(
  'accounts/closeAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      await accountsService.closeAccount(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to close account');
    }
  }
);

export const getAccountBalance = createAsyncThunk(
  'accounts/getAccountBalance',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await accountsService.getAccountBalance(accountId);
      return { accountId, balance: response.balance };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get account balance');
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    selectAccount: (state, action) => {
      state.selectedAccount = state.accounts.find(account => account.id === action.payload) || null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateAccountBalance: (state, action) => {
      const { accountId, balance } = action.payload;
      const account = state.accounts.find(acc => acc.id === accountId);
      if (account) {
        account.balance = balance;
        account.lastTransactionAt = new Date().toISOString();
      }
      // Recalculate total balance
      state.totalBalance = state.accounts.reduce((total, acc) => total + acc.balance, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
        state.totalBalance = action.payload.reduce((total: number, account: Account) => total + account.balance, 0);
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
        state.totalBalance += action.payload.balance;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update account
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(account => account.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
          state.totalBalance = state.accounts.reduce((total, account) => total + account.balance, 0);
        }
      })
      
      // Close account
      .addCase(closeAccount.fulfilled, (state, action) => {
        const accountIndex = state.accounts.findIndex(account => account.id === action.payload);
        if (accountIndex !== -1) {
          const account = state.accounts[accountIndex];
          state.totalBalance -= account.balance;
          state.accounts.splice(accountIndex, 1);
        }
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
      })
      
      // Get account balance
      .addCase(getAccountBalance.fulfilled, (state, action) => {
        const { accountId, balance } = action.payload;
        const account = state.accounts.find(acc => acc.id === accountId);
        if (account) {
          const oldBalance = account.balance;
          account.balance = balance;
          account.lastTransactionAt = new Date().toISOString();
          state.totalBalance = state.totalBalance - oldBalance + balance;
        }
      });
  },
});

export const { selectAccount, clearError, updateAccountBalance } = accountsSlice.actions;
export default accountsSlice.reducer;
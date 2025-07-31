import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionsService from '../../services/transactionsService';

export interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal' | 'payment' | 'loan_payment' | 'fee';
  amount: number;
  currency: 'TND' | 'USD' | 'EUR';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromAccountNumber?: string;
  toAccountNumber?: string;
  recipientName?: string;
  recipientBank?: string;
  createdAt: string;
  completedAt?: string;
  fee: number;
  exchangeRate?: number;
  category?: string;
  tags?: string[];
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  recipientName?: string;
  recipientBank?: string;
  scheduleDate?: string;
  isInternational?: boolean;
}

interface TransactionsState {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  transferLoading: boolean;
  lastTransactionId?: string;
  filters: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
  };
}

const initialState: TransactionsState = {
  transactions: [],
  pendingTransactions: [],
  loading: false,
  error: null,
  transferLoading: false,
  filters: {},
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: { accountId?: string; page?: number; limit?: number; filters?: any }, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactions(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const createTransfer = createAsyncThunk(
  'transactions/createTransfer',
  async (transferData: TransferRequest, { rejectWithValue }) => {
    try {
      const response = await transactionsService.createTransfer(transferData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

export const confirmTransfer = createAsyncThunk(
  'transactions/confirmTransfer',
  async ({ transactionId, confirmationCode }: { transactionId: string; confirmationCode: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsService.confirmTransfer(transactionId, confirmationCode);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Transfer confirmation failed');
    }
  }
);

export const cancelTransfer = createAsyncThunk(
  'transactions/cancelTransfer',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      await transactionsService.cancelTransfer(transactionId);
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel transfer');
    }
  }
);

export const getTransactionDetails = createAsyncThunk(
  'transactions/getTransactionDetails',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await transactionsService.getTransactionDetails(transactionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get transaction details');
    }
  }
);

export const scheduleTransfer = createAsyncThunk(
  'transactions/scheduleTransfer',
  async (transferData: TransferRequest & { scheduleDate: string; recurring?: boolean; recurringPeriod?: string }, { rejectWithValue }) => {
    try {
      const response = await transactionsService.scheduleTransfer(transferData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to schedule transfer');
    }
  }
);

export const payBill = createAsyncThunk(
  'transactions/payBill',
  async (billData: {
    accountId: string;
    billType: string;
    billNumber: string;
    amount: number;
    dueDate?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await transactionsService.payBill(billData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Bill payment failed');
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    addPendingTransaction: (state, action) => {
      state.pendingTransactions.push(action.payload);
    },
    removePendingTransaction: (state, action) => {
      state.pendingTransactions = state.pendingTransactions.filter(
        transaction => transaction.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions || action.payload;
        state.pendingTransactions = state.transactions.filter(t => t.status === 'pending');
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create transfer
      .addCase(createTransfer.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })
      .addCase(createTransfer.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transactions.unshift(action.payload);
        state.lastTransactionId = action.payload.id;
        if (action.payload.status === 'pending') {
          state.pendingTransactions.unshift(action.payload);
        }
      })
      .addCase(createTransfer.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload as string;
      })
      
      // Confirm transfer
      .addCase(confirmTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmTransfer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        state.pendingTransactions = state.pendingTransactions.filter(
          t => t.id !== action.payload.id
        );
      })
      .addCase(confirmTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Cancel transfer
      .addCase(cancelTransfer.fulfilled, (state, action) => {
        const transactionId = action.payload;
        state.transactions = state.transactions.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, status: 'cancelled' as const }
            : transaction
        );
        state.pendingTransactions = state.pendingTransactions.filter(
          transaction => transaction.id !== transactionId
        );
      })
      
      // Schedule transfer
      .addCase(scheduleTransfer.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })
      .addCase(scheduleTransfer.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transactions.unshift(action.payload);
        state.lastTransactionId = action.payload.id;
      })
      .addCase(scheduleTransfer.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload as string;
      })
      
      // Pay bill
      .addCase(payBill.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })
      .addCase(payBill.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(payBill.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  addPendingTransaction,
  removePendingTransaction,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
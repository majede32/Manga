import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loansService from '../../services/loansService';

export interface Loan {
  id: string;
  type: 'personal' | 'business' | 'housing' | 'car' | 'student';
  amount: number;
  approvedAmount?: number;
  currency: 'TND';
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted';
  purpose: string;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  nextPaymentDate?: string;
  remainingBalance: number;
  paidAmount: number;
  totalInterest: number;
  latePaymentFee: number;
  creditScore?: number;
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
  documents: {
    id: string;
    type: string;
    name: string;
    url: string;
    status: 'pending' | 'verified' | 'rejected';
  }[];
  paymentHistory: {
    id: string;
    amount: number;
    principal: number;
    interest: number;
    fee: number;
    date: string;
    status: 'paid' | 'late' | 'missed';
  }[];
}

export interface LoanApplication {
  type: Loan['type'];
  amount: number;
  termMonths: number;
  purpose: string;
  income: number;
  employmentStatus: string;
  employerName?: string;
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
  documents: File[];
}

interface LoansState {
  loans: Loan[];
  activeLoans: Loan[];
  loanApplications: Loan[];
  selectedLoan: Loan | null;
  loading: boolean;
  error: string | null;
  applicationLoading: boolean;
  loanCalculator: {
    amount: number;
    termMonths: number;
    interestRate: number;
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  };
  loanTypes: {
    type: string;
    name: string;
    minAmount: number;
    maxAmount: number;
    minTerm: number;
    maxTerm: number;
    interestRate: number;
    requirements: string[];
  }[];
}

const initialState: LoansState = {
  loans: [],
  activeLoans: [],
  loanApplications: [],
  selectedLoan: null,
  loading: false,
  error: null,
  applicationLoading: false,
  loanCalculator: {
    amount: 0,
    termMonths: 0,
    interestRate: 0,
    monthlyPayment: 0,
    totalPayment: 0,
    totalInterest: 0,
  },
  loanTypes: [],
};

// Async thunks
export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loansService.getLoans();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loans');
    }
  }
);

export const fetchLoanTypes = createAsyncThunk(
  'loans/fetchLoanTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await loansService.getLoanTypes();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan types');
    }
  }
);

export const submitLoanApplication = createAsyncThunk(
  'loans/submitLoanApplication',
  async (applicationData: LoanApplication, { rejectWithValue }) => {
    try {
      const response = await loansService.submitLoanApplication(applicationData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit loan application');
    }
  }
);

export const calculateLoan = createAsyncThunk(
  'loans/calculateLoan',
  async ({ amount, termMonths, loanType }: { amount: number; termMonths: number; loanType: string }, { rejectWithValue }) => {
    try {
      const response = await loansService.calculateLoan({ amount, termMonths, loanType });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate loan');
    }
  }
);

export const makePayment = createAsyncThunk(
  'loans/makePayment',
  async ({ loanId, amount, accountId }: { loanId: string; amount: number; accountId: string }, { rejectWithValue }) => {
    try {
      const response = await loansService.makePayment(loanId, amount, accountId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Payment failed');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'loans/uploadDocument',
  async ({ loanId, file, documentType }: { loanId: string; file: File; documentType: string }, { rejectWithValue }) => {
    try {
      const response = await loansService.uploadDocument(loanId, file, documentType);
      return { loanId, document: response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Document upload failed');
    }
  }
);

export const getLoanDetails = createAsyncThunk(
  'loans/getLoanDetails',
  async (loanId: string, { rejectWithValue }) => {
    try {
      const response = await loansService.getLoanDetails(loanId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get loan details');
    }
  }
);

export const prepayLoan = createAsyncThunk(
  'loans/prepayLoan',
  async ({ loanId, amount }: { loanId: string; amount: number }, { rejectWithValue }) => {
    try {
      const response = await loansService.prepayLoan(loanId, amount);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Prepayment failed');
    }
  }
);

const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    selectLoan: (state, action) => {
      state.selectedLoan = state.loans.find(loan => loan.id === action.payload) || null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateLoanCalculator: (state, action) => {
      state.loanCalculator = { ...state.loanCalculator, ...action.payload };
    },
    clearLoanCalculator: (state) => {
      state.loanCalculator = {
        amount: 0,
        termMonths: 0,
        interestRate: 0,
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loans
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
        state.activeLoans = action.payload.filter((loan: Loan) => loan.status === 'active');
        state.loanApplications = action.payload.filter((loan: Loan) => 
          ['draft', 'submitted', 'under_review', 'approved'].includes(loan.status)
        );
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch loan types
      .addCase(fetchLoanTypes.fulfilled, (state, action) => {
        state.loanTypes = action.payload;
      })
      
      // Submit loan application
      .addCase(submitLoanApplication.pending, (state) => {
        state.applicationLoading = true;
        state.error = null;
      })
      .addCase(submitLoanApplication.fulfilled, (state, action) => {
        state.applicationLoading = false;
        state.loans.unshift(action.payload);
        state.loanApplications.unshift(action.payload);
      })
      .addCase(submitLoanApplication.rejected, (state, action) => {
        state.applicationLoading = false;
        state.error = action.payload as string;
      })
      
      // Calculate loan
      .addCase(calculateLoan.fulfilled, (state, action) => {
        state.loanCalculator = action.payload;
      })
      
      // Make payment
      .addCase(makePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makePayment.fulfilled, (state, action) => {
        state.loading = false;
        const loanIndex = state.loans.findIndex(loan => loan.id === action.payload.loanId);
        if (loanIndex !== -1) {
          state.loans[loanIndex] = action.payload.loan;
          const activeLoanIndex = state.activeLoans.findIndex(loan => loan.id === action.payload.loanId);
          if (activeLoanIndex !== -1) {
            state.activeLoans[activeLoanIndex] = action.payload.loan;
          }
        }
      })
      .addCase(makePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Upload document
      .addCase(uploadDocument.fulfilled, (state, action) => {
        const { loanId, document } = action.payload;
        const loan = state.loans.find(l => l.id === loanId);
        if (loan) {
          loan.documents.push(document);
        }
      })
      
      // Get loan details
      .addCase(getLoanDetails.fulfilled, (state, action) => {
        state.selectedLoan = action.payload;
        const loanIndex = state.loans.findIndex(loan => loan.id === action.payload.id);
        if (loanIndex !== -1) {
          state.loans[loanIndex] = action.payload;
        }
      })
      
      // Prepay loan
      .addCase(prepayLoan.fulfilled, (state, action) => {
        const loanIndex = state.loans.findIndex(loan => loan.id === action.payload.id);
        if (loanIndex !== -1) {
          state.loans[loanIndex] = action.payload;
          const activeLoanIndex = state.activeLoans.findIndex(loan => loan.id === action.payload.id);
          if (activeLoanIndex !== -1) {
            if (action.payload.status === 'completed') {
              state.activeLoans.splice(activeLoanIndex, 1);
            } else {
              state.activeLoans[activeLoanIndex] = action.payload;
            }
          }
        }
      });
  },
});

export const {
  selectLoan,
  clearError,
  updateLoanCalculator,
  clearLoanCalculator,
} = loansSlice.actions;

export default loansSlice.reducer;
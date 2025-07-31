// أنواع المستخدمين
export interface User {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  userType: 'individual' | 'business' | 'employee';
  status: 'active' | 'inactive' | 'suspended';
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
  userType: 'individual' | 'business' | 'employee';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

// أنواع الحسابات
export interface Account {
  id: number;
  userId: number;
  accountNumber: string;
  accountType: 'current' | 'savings' | 'loan';
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountRequest {
  userId: number;
  accountType: 'current' | 'savings';
  initialBalance?: number;
}

// أنواع المعاملات
export interface Transaction {
  id: number;
  transactionId: string;
  fromAccountId?: number;
  toAccountId?: number;
  amount: number;
  currency: string;
  transactionType: 'transfer' | 'deposit' | 'withdrawal' | 'loan_payment' | 'loan_disbursement';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateTransactionRequest {
  fromAccountId?: number;
  toAccountId?: number;
  amount: number;
  transactionType: 'transfer' | 'deposit' | 'withdrawal';
  description?: string;
}

// أنواع القروض
export interface Loan {
  id: number;
  userId: number;
  accountId?: number;
  loanNumber: string;
  amount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted';
  purpose?: string;
  createdAt: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
}

export interface CreateLoanRequest {
  userId: number;
  amount: number;
  termMonths: number;
  purpose?: string;
}

export interface LoanPayment {
  id: number;
  loanId: number;
  paymentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'defaulted';
  createdAt: Date;
}

// أنواع الإشعارات
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  readAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// أنواع المصادقة
export interface LoginRequest {
  nationalId: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RegisterRequest {
  nationalId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
  userType: 'individual' | 'business';
}

// أنواع API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// أنواع الطلبات
export interface RequestWithUser extends Express.Request {
  user?: User;
}

// أنواع الأخطاء
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// أنواع التحقق
export interface ValidationError {
  field: string;
  message: string;
}

// أنواع الدفع
export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
}

export interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
}

// أنواع التقارير
export interface TransactionReport {
  totalTransactions: number;
  totalAmount: number;
  currency: string;
  period: {
    start: Date;
    end: Date;
  };
  transactions: Transaction[];
}

export interface AccountReport {
  accountId: number;
  accountNumber: string;
  balance: number;
  currency: string;
  transactions: Transaction[];
  loanPayments?: LoanPayment[];
}

// أنواع WebSocket
export interface SocketMessage {
  userId: string;
  message: string;
  timestamp: Date;
}

export interface SocketEvent {
  type: 'message' | 'notification' | 'transaction' | 'loan_update';
  data: any;
}
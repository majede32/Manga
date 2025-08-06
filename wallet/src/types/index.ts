/**
 * MADU Wallet Types
 * أنواع البيانات لنظام المحافظ الرقمية
 */

// استيراد الأنواع من البلوك تشين
export * from '../../blockchain/src/types';

// أنواع إضافية خاصة بالمحافظ
export interface IWalletManager {
  wallets: Map<string, IWallet>;
  createWallet(country?: CountryCode, kycLevel?: KYCLevel): Promise<IWallet>;
  importWallet(data: string, format?: WalletFormat): Promise<IWallet>;
  getWallet(address: string): IWallet | undefined;
  removeWallet(address: string): boolean;
  listWallets(): IWallet[];
}

export interface IMultiSigWallet extends IWallet {
  owners: string[];
  requiredSignatures: number;
  pendingTransactions: Map<string, IMultiSigTransaction>;
}

export interface IMultiSigTransaction extends ITransaction {
  signatures: Map<string, string>;
  executed: boolean;
  confirmationCount: number;
}

export interface IWalletBackup {
  wallets: IWalletExport[];
  createdAt: number;
  version: string;
  checksum: string;
}

export interface IWalletExport {
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  mnemonic?: string;
  country: CountryCode;
  kycLevel: KYCLevel;
  metadata: IWalletMetadata;
}

export interface IWalletMetadata {
  name?: string;
  description?: string;
  tags: string[];
  createdAt: number;
  lastUsed: number;
  isWatchOnly: boolean;
  isMultiSig: boolean;
}

export enum WalletFormat {
  JSON = 'json',
  KEYSTORE = 'keystore',
  MNEMONIC = 'mnemonic',
  PRIVATE_KEY = 'private_key'
}

export enum WalletType {
  STANDARD = 'standard',
  MULTI_SIG = 'multi_sig',
  WATCH_ONLY = 'watch_only',
  HARDWARE = 'hardware'
}

export interface IWalletConfig {
  defaultCountry: CountryCode;
  defaultKYCLevel: KYCLevel;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  autoLockTimeout: number; // بالدقائق
}

export interface IWalletSecurity {
  requirePassword: boolean;
  requireBiometric: boolean;
  requireTwoFactor: boolean;
  maxFailedAttempts: number;
  lockoutDuration: number; // بالدقائق
}

export interface IWalletConnection {
  nodeUrl: string;
  networkId: string;
  chainId: number;
  isConnected: boolean;
  lastSync: number;
}

export interface ITransactionRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  type?: TransactionType;
  data?: any;
  gasLimit?: number;
  gasPrice?: number;
}

export interface ITransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  gasUsed?: number;
  blockNumber?: number;
  confirmations: number;
}

export interface IWalletEvent {
  type: WalletEventType;
  walletAddress: string;
  data: any;
  timestamp: number;
}

export enum WalletEventType {
  WALLET_CREATED = 'wallet_created',
  WALLET_IMPORTED = 'wallet_imported',
  WALLET_REMOVED = 'wallet_removed',
  TRANSACTION_SENT = 'transaction_sent',
  TRANSACTION_RECEIVED = 'transaction_received',
  BALANCE_UPDATED = 'balance_updated',
  WALLET_LOCKED = 'wallet_locked',
  WALLET_UNLOCKED = 'wallet_unlocked'
}

export interface IContactInfo {
  id: string;
  name: string;
  address: string;
  country: CountryCode;
  tags: string[];
  isFavorite: boolean;
  addedAt: number;
  lastUsed: number;
}

export interface IAddressBook {
  contacts: Map<string, IContactInfo>;
  addContact(contact: IContactInfo): boolean;
  removeContact(id: string): boolean;
  updateContact(id: string, updates: Partial<IContactInfo>): boolean;
  findByAddress(address: string): IContactInfo | undefined;
  searchContacts(query: string): IContactInfo[];
}

export interface IWalletHistory {
  address: string;
  transactions: ITransaction[];
  totalPages: number;
  currentPage: number;
  lastUpdated: number;
}

export interface IWalletAnalytics {
  totalTransactions: number;
  totalSent: number;
  totalReceived: number;
  averageTransactionValue: number;
  mostActiveDay: string;
  favoriteRecipient: string;
  transactionsByType: Record<TransactionType, number>;
  monthlyVolume: Record<string, number>;
}

export interface IExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: number;
  source: string;
}

export interface IWalletNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

export enum NotificationType {
  TRANSACTION_RECEIVED = 'transaction_received',
  TRANSACTION_SENT = 'transaction_sent',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  BALANCE_LOW = 'balance_low',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_UPDATE = 'system_update'
}

export interface IWalletSettings {
  general: {
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
  };
  security: IWalletSecurity;
  privacy: {
    hideBalances: boolean;
    enableAnalytics: boolean;
    shareUsageData: boolean;
  };
  advanced: {
    customRPCEndpoint?: string;
    enableTestnet: boolean;
    developerMode: boolean;
  };
}

// أنواع الأخطاء
export class WalletError extends Error {
  constructor(
    message: string,
    public code: WalletErrorCode,
    public details?: any
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export enum WalletErrorCode {
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_LOCKED = 'WALLET_LOCKED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_MNEMONIC = 'INVALID_MNEMONIC',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  IMPORT_ERROR = 'IMPORT_ERROR',
  EXPORT_ERROR = 'EXPORT_ERROR'
}
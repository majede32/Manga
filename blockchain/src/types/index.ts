/**
 * MADU Blockchain Core Types
 * أنواع البيانات الأساسية لبلوك تشين الدينار المغاربي
 */

export interface ITransaction {
  id: string;
  fromAddress: string | null; // null للمعاملات المنشئة (genesis)
  toAddress: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature?: string;
  data?: any; // بيانات إضافية للعقود الذكية
  type: TransactionType;
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  SMART_CONTRACT = 'SMART_CONTRACT',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  REWARD = 'REWARD',
  GENESIS = 'GENESIS'
}

export interface IBlock {
  index: number;
  timestamp: number;
  transactions: ITransaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
  difficulty: number;
  validator?: string; // عنوان المُصدّق في نظام PoS
  signature?: string; // توقيع المُصدّق
}

export interface IBlockchain {
  chain: IBlock[];
  difficulty: number;
  pendingTransactions: ITransaction[];
  miningReward: number;
  validators: Map<string, IValidator>;
}

export interface IValidator {
  address: string;
  stake: number;
  isActive: boolean;
  reputation: number;
  joinedAt: number;
  country: CountryCode;
}

export enum CountryCode {
  TUNISIA = 'TN',
  LIBYA = 'LY',
  ALGERIA = 'DZ'
}

export interface IWallet {
  address: string;
  publicKey: string;
  privateKey: string;
  balance: number;
}

export interface INode {
  id: string;
  address: string;
  port: number;
  country: CountryCode;
  isValidator: boolean;
  lastSeen: number;
  version: string;
}

export interface INetworkMessage {
  type: MessageType;
  payload: any;
  timestamp: number;
  senderId: string;
  signature: string;
}

export enum MessageType {
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  NEW_BLOCK = 'NEW_BLOCK',
  BLOCK_REQUEST = 'BLOCK_REQUEST',
  BLOCK_RESPONSE = 'BLOCK_RESPONSE',
  PEER_DISCOVERY = 'PEER_DISCOVERY',
  VALIDATOR_ANNOUNCEMENT = 'VALIDATOR_ANNOUNCEMENT'
}

export interface IConsensusConfig {
  algorithm: ConsensusAlgorithm;
  blockTime: number; // بالثواني
  minValidators: number;
  maxValidators: number;
  slashingPenalty: number; // نسبة معاقبة المُصدّقين المخطئين
  rewardDistribution: IRewardDistribution;
}

export enum ConsensusAlgorithm {
  PROOF_OF_STAKE = 'PoS',
  DELEGATED_PROOF_OF_STAKE = 'DPoS'
}

export interface IRewardDistribution {
  validator: number; // نسبة المُصدّق
  stakers: number; // نسبة المُراهنين
  treasury: number; // نسبة الخزينة
}

export interface IChainConfig {
  name: string;
  chainId: number;
  currency: ICurrencyInfo;
  genesis: IGenesisConfig;
  consensus: IConsensusConfig;
  network: INetworkConfig;
}

export interface ICurrencyInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  countries: CountryCode[];
}

export interface IGenesisConfig {
  timestamp: number;
  initialValidators: string[];
  premine: IPremineAllocation[];
  difficulty: number;
}

export interface IPremineAllocation {
  address: string;
  amount: number;
  purpose: string;
  country: CountryCode;
}

export interface INetworkConfig {
  p2pPort: number;
  rpcPort: number;
  maxPeers: number;
  seedNodes: string[];
  networkId: string;
}

export interface ISmartContract {
  address: string;
  code: string;
  state: any;
  creator: string;
  createdAt: number;
  version: string;
}

export interface IKYCData {
  userId: string;
  level: KYCLevel;
  documents: IDocument[];
  verifiedAt: number;
  expiresAt: number;
  country: CountryCode;
}

export enum KYCLevel {
  BASIC = 1,
  ENHANCED = 2,
  PREMIUM = 3
}

export interface IDocument {
  type: DocumentType;
  hash: string;
  verifiedBy: string;
  verifiedAt: number;
}

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  UTILITY_BILL = 'UTILITY_BILL',
  BANK_STATEMENT = 'BANK_STATEMENT'
}

export interface IAMLAlert {
  id: string;
  transactionId: string;
  riskLevel: RiskLevel;
  reason: string;
  detectedAt: number;
  status: AlertStatus;
  investigatedBy?: string;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE'
}

export interface IAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
  requestId: string;
}

export interface IPaginatedResponse<T> extends IAPIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
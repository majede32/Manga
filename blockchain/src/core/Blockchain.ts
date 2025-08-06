/**
 * MADU Blockchain Core
 * النواة الأساسية لبلوك تشين الدينار المغاربي
 */

import { IBlockchain, ITransaction, IValidator, TransactionType, CountryCode } from '../types';
import { Block } from './Block';
import { Transaction } from './Transaction';
import { getChainConfig, CONSTANTS } from '../config';
import * as crypto from 'crypto';

export class Blockchain implements IBlockchain {
  public chain: Block[];
  public difficulty: number;
  public pendingTransactions: ITransaction[];
  public miningReward: number;
  public validators: Map<string, IValidator>;
  private balances: Map<string, number>;
  private transactionPool: Map<string, ITransaction>;

  constructor() {
    const config = getChainConfig();
    
    this.chain = [];
    this.difficulty = config.genesis.difficulty;
    this.pendingTransactions = [];
    this.miningReward = 50; // 50 MADU مكافأة الكتلة
    this.validators = new Map();
    this.balances = new Map();
    this.transactionPool = new Map();

    // إنشاء كتلة الجينيسيس
    this.createGenesisBlock();
  }

  /**
   * إنشاء كتلة الجينيسيس
   */
  private createGenesisBlock(): void {
    const config = getChainConfig();
    const genesisTransactions: ITransaction[] = [];

    // إضافة المعاملات الأولية (premine)
    for (const premine of config.genesis.premine) {
      const tx = Transaction.createGenesisTransaction(
        premine.address,
        premine.amount
      );
      genesisTransactions.push(tx.toJSON());
      
      // تحديث الأرصدة
      this.balances.set(premine.address, premine.amount);
    }

    // إضافة المُصدّقين الأوليين
    for (const validatorAddress of config.genesis.initialValidators) {
      const validator: IValidator = {
        address: validatorAddress,
        stake: 1000000, // مليون MADU كرهان أولي
        isActive: true,
        reputation: 100,
        joinedAt: Date.now(),
        country: this.getCountryFromAddress(validatorAddress)
      };
      this.validators.set(validatorAddress, validator);
    }

    const genesisBlock = Block.createGenesisBlock(genesisTransactions);
    this.chain.push(genesisBlock);

    console.log('تم إنشاء كتلة الجينيسيس بنجاح');
    console.log(`المعاملات الأولية: ${genesisTransactions.length}`);
    console.log(`المُصدّقين الأوليين: ${config.genesis.initialValidators.length}`);
  }

  /**
   * الحصول على آخر كتلة في السلسلة
   */
  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  /**
   * إضافة معاملة جديدة إلى البول
   */
  addTransaction(transaction: ITransaction): boolean {
    try {
      const tx = Transaction.fromJSON(transaction);

      // التحقق من صحة المعاملة
      if (!tx.isValid() || !tx.isBusinessValid()) {
        console.error('المعاملة غير صحيحة');
        return false;
      }

      // التحقق من عدم وجود المعاملة مسبقاً
      if (this.transactionPool.has(tx.id) || this.isTransactionInChain(tx.id)) {
        console.error('المعاملة موجودة مسبقاً');
        return false;
      }

      // التحقق من الرصيد (إذا لم تكن معاملة جينيسيس أو مكافأة)
      if (tx.fromAddress && !this.hasEnoughBalance(tx.fromAddress, tx.amount + tx.fee)) {
        console.error('الرصيد غير كافي');
        return false;
      }

      // التحقق من حدود KYC/AML
      if (!this.checkTransactionLimits(tx)) {
        console.error('تم تجاوز حدود المعاملات');
        return false;
      }

      // إضافة المعاملة إلى البول
      this.transactionPool.set(tx.id, tx.toJSON());
      this.pendingTransactions.push(tx.toJSON());

      console.log(`تم إضافة المعاملة ${tx.id} إلى البول`);
      return true;
    } catch (error) {
      console.error('خطأ في إضافة المعاملة:', error);
      return false;
    }
  }

  /**
   * تعدين كتلة جديدة (PoW للاختبار)
   */
  minePendingTransactions(miningRewardAddress: string): Block | null {
    if (this.pendingTransactions.length === 0) {
      console.log('لا توجد معاملات معلقة للتعدين');
      return null;
    }

    // إضافة معاملة المكافأة
    const rewardTx = Transaction.createRewardTransaction(
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.unshift(rewardTx.toJSON());

    // إنشاء الكتلة الجديدة
    const block = new Block(
      this.chain.length,
      [...this.pendingTransactions],
      this.getLatestBlock().hash,
      this.difficulty
    );

    // تعدين الكتلة
    block.mineBlock();

    // التحقق من صحة الكتلة
    if (!block.isValid(this.getLatestBlock())) {
      console.error('الكتلة المُعدّنة غير صحيحة');
      return null;
    }

    // إضافة الكتلة إلى السلسلة
    this.chain.push(block);

    // تحديث الأرصدة
    this.updateBalances(block);

    // مسح المعاملات المعلقة
    this.pendingTransactions = [];
    this.transactionPool.clear();

    // تعديل الصعوبة
    this.adjustDifficulty();

    console.log(`تم تعدين الكتلة ${block.index} بنجاح`);
    return block;
  }

  /**
   * إنتاج كتلة جديدة (PoS)
   */
  async produceBlock(validatorAddress: string): Promise<Block | null> {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    // التحقق من أن المُصدّق نشط
    const validator = this.validators.get(validatorAddress);
    if (!validator || !validator.isActive) {
      console.error('المُصدّق غير نشط');
      return null;
    }

    // التحقق من دور المُصدّق
    if (!this.isValidatorTurn(validatorAddress)) {
      console.error('ليس دور هذا المُصدّق');
      return null;
    }

    // إضافة معاملة المكافأة
    const rewardTx = Transaction.createRewardTransaction(
      validatorAddress,
      this.miningReward
    );
    this.pendingTransactions.unshift(rewardTx.toJSON());

    // إنشاء الكتلة
    const block = new Block(
      this.chain.length,
      [...this.pendingTransactions],
      this.getLatestBlock().hash,
      this.difficulty,
      validatorAddress
    );

    // إضافة الكتلة إلى السلسلة
    this.chain.push(block);

    // تحديث الأرصدة
    this.updateBalances(block);

    // مسح المعاملات المعلقة
    this.pendingTransactions = [];
    this.transactionPool.clear();

    console.log(`تم إنتاج الكتلة ${block.index} بواسطة ${validatorAddress}`);
    return block;
  }

  /**
   * التحقق من دور المُصدّق في PoS
   */
  private isValidatorTurn(validatorAddress: string): boolean {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive)
      .sort((a, b) => a.address.localeCompare(b.address));

    if (activeValidators.length === 0) {
      return false;
    }

    const blockTime = getChainConfig().consensus.blockTime * 1000;
    const currentSlot = Math.floor(Date.now() / blockTime);
    const validatorIndex = currentSlot % activeValidators.length;

    return activeValidators[validatorIndex].address === validatorAddress;
  }

  /**
   * الحصول على رصيد عنوان
   */
  getBalance(address: string): number {
    let balance = this.balances.get(address) || 0;

    // إضافة المعاملات المعلقة
    for (const tx of this.pendingTransactions) {
      if (tx.fromAddress === address) {
        balance -= (tx.amount + tx.fee);
      }
      if (tx.toAddress === address) {
        balance += tx.amount;
      }
    }

    return Math.max(0, balance);
  }

  /**
   * تحديث الأرصدة بعد إضافة كتلة
   */
  private updateBalances(block: Block): void {
    for (const tx of block.transactions) {
      if (tx.fromAddress) {
        const currentBalance = this.balances.get(tx.fromAddress) || 0;
        this.balances.set(tx.fromAddress, currentBalance - tx.amount - tx.fee);
      }

      const currentBalance = this.balances.get(tx.toAddress) || 0;
      this.balances.set(tx.toAddress, currentBalance + tx.amount);
    }
  }

  /**
   * التحقق من كفاية الرصيد
   */
  private hasEnoughBalance(address: string, amount: number): boolean {
    return this.getBalance(address) >= amount;
  }

  /**
   * التحقق من وجود المعاملة في السلسلة
   */
  private isTransactionInChain(txId: string): boolean {
    for (const block of this.chain) {
      if (block.findTransaction(txId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * التحقق من حدود المعاملات (KYC/AML)
   */
  private checkTransactionLimits(tx: Transaction): boolean {
    if (tx.amount < CONSTANTS.AML_MONITORING_THRESHOLD) {
      return true; // تحت العتبة المراقبة
    }

    // التحقق من مستوى KYC وتطبيق الحدود
    // هذا مبسط - في التطبيق الحقيقي نحتاج للتحقق من قاعدة بيانات KYC
    return true;
  }

  /**
   * تعديل صعوبة التعدين
   */
  private adjustDifficulty(): void {
    const config = getChainConfig();
    const targetBlockTime = config.consensus.blockTime * 1000;
    
    if (this.chain.length < 10) {
      return; // انتظار عدد كافي من الكتل
    }

    const recentBlocks = this.chain.slice(-10);
    const timeTaken = recentBlocks[9].timestamp - recentBlocks[0].timestamp;
    const expectedTime = targetBlockTime * 9;

    if (timeTaken < expectedTime / 2) {
      this.difficulty++;
      console.log(`زيادة الصعوبة إلى ${this.difficulty}`);
    } else if (timeTaken > expectedTime * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
      console.log(`تقليل الصعوبة إلى ${this.difficulty}`);
    }
  }

  /**
   * التحقق من صحة السلسلة
   */
  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.isValid(previousBlock)) {
        return false;
      }
    }
    return true;
  }

  /**
   * إضافة مُصدّق جديد
   */
  addValidator(validator: IValidator): boolean {
    if (this.validators.has(validator.address)) {
      return false;
    }

    if (validator.stake < CONSTANTS.MIN_STAKE_AMOUNT) {
      return false;
    }

    this.validators.set(validator.address, validator);
    console.log(`تم إضافة المُصدّق ${validator.address}`);
    return true;
  }

  /**
   * إزالة مُصدّق
   */
  removeValidator(address: string): boolean {
    if (!this.validators.has(address)) {
      return false;
    }

    this.validators.delete(address);
    console.log(`تم إزالة المُصدّق ${address}`);
    return true;
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): object {
    const totalSupply = Array.from(this.balances.values())
      .reduce((sum, balance) => sum + balance, 0);

    return {
      blockCount: this.chain.length,
      totalTransactions: this.chain.reduce((sum, block) => sum + block.transactions.length, 0),
      totalSupply,
      activeValidators: Array.from(this.validators.values()).filter(v => v.isActive).length,
      pendingTransactions: this.pendingTransactions.length,
      difficulty: this.difficulty,
      lastBlockTime: this.getLatestBlock().timestamp,
      averageBlockTime: this.getAverageBlockTime()
    };
  }

  /**
   * حساب متوسط وقت الكتلة
   */
  private getAverageBlockTime(): number {
    if (this.chain.length < 2) {
      return 0;
    }

    const recentBlocks = this.chain.slice(-10);
    const timeDiff = recentBlocks[recentBlocks.length - 1].timestamp - recentBlocks[0].timestamp;
    return timeDiff / (recentBlocks.length - 1);
  }

  /**
   * تحديد البلد من العنوان (مبسط)
   */
  private getCountryFromAddress(address: string): CountryCode {
    const lastChar = address.charAt(address.length - 1);
    if (lastChar >= '0' && lastChar <= '3') return CountryCode.TUNISIA;
    if (lastChar >= '4' && lastChar <= '7') return CountryCode.LIBYA;
    return CountryCode.ALGERIA;
  }

  /**
   * البحث عن معاملة بالمعرف
   */
  findTransaction(txId: string): ITransaction | null {
    // البحث في المعاملات المعلقة
    const pendingTx = this.transactionPool.get(txId);
    if (pendingTx) {
      return pendingTx;
    }

    // البحث في السلسلة
    for (const block of this.chain) {
      const tx = block.findTransaction(txId);
      if (tx) {
        return tx;
      }
    }

    return null;
  }

  /**
   * الحصول على تاريخ المعاملات لعنوان
   */
  getTransactionHistory(address: string, limit: number = 50): ITransaction[] {
    const transactions: ITransaction[] = [];

    for (const block of this.chain.reverse()) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          transactions.push(tx);
          if (transactions.length >= limit) {
            return transactions;
          }
        }
      }
    }

    return transactions;
  }
}
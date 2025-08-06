/**
 * MADU Block Class
 * فئة الكتلة للدينار المغاربي الرقمي
 */

import * as crypto from 'crypto';
import { MerkleTree } from 'merkletreejs';
import { IBlock, ITransaction } from '../types';
import { Transaction } from './Transaction';
import { CONSTANTS } from '../config';

export class Block implements IBlock {
  public index: number;
  public timestamp: number;
  public transactions: ITransaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public merkleRoot: string;
  public difficulty: number;
  public validator?: string;
  public signature?: string;

  constructor(
    index: number,
    transactions: ITransaction[],
    previousHash: string,
    difficulty: number = 4,
    validator?: string
  ) {
    this.index = index;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.difficulty = difficulty;
    this.validator = validator;
    this.timestamp = Date.now();
    this.nonce = 0;
    this.merkleRoot = this.calculateMerkleRoot();
    this.hash = this.calculateHash();
  }

  /**
   * حساب Merkle Root للمعاملات
   */
  calculateMerkleRoot(): string {
    if (this.transactions.length === 0) {
      return crypto.createHash('sha256').update('').digest('hex');
    }

    const leaves = this.transactions.map(tx => 
      crypto.createHash('sha256').update(tx.id).digest()
    );

    const tree = new MerkleTree(leaves, crypto.createHash('sha256'), {
      sort: true
    });

    return tree.getRoot().toString('hex');
  }

  /**
   * حساب hash الكتلة
   */
  calculateHash(): string {
    const blockData = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      merkleRoot: this.merkleRoot,
      nonce: this.nonce,
      difficulty: this.difficulty,
      validator: this.validator,
      transactionCount: this.transactions.length
    });

    return crypto
      .createHash('sha256')
      .update(blockData)
      .digest('hex');
  }

  /**
   * تعدين الكتلة (Proof of Work للاختبار)
   */
  mineBlock(): void {
    const target = Array(this.difficulty + 1).join('0');
    
    console.log(`بدء تعدين الكتلة ${this.index}...`);
    const startTime = Date.now();

    while (this.hash.substring(0, this.difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
      
      // إظهار التقدم كل مليون محاولة
      if (this.nonce % 1000000 === 0) {
        console.log(`المحاولة: ${this.nonce}, Hash: ${this.hash}`);
      }
    }

    const endTime = Date.now();
    console.log(`تم تعدين الكتلة ${this.index} في ${endTime - startTime}ms`);
    console.log(`Hash: ${this.hash}`);
    console.log(`Nonce: ${this.nonce}`);
  }

  /**
   * التحقق من صحة الكتلة
   */
  isValid(previousBlock?: Block): boolean {
    try {
      // التحقق من hash الكتلة
      if (this.hash !== this.calculateHash()) {
        console.error('Hash الكتلة غير صحيح');
        return false;
      }

      // التحقق من الكتلة السابقة
      if (previousBlock && this.previousHash !== previousBlock.hash) {
        console.error('الربط مع الكتلة السابقة غير صحيح');
        return false;
      }

      // التحقق من المؤشر
      if (previousBlock && this.index !== previousBlock.index + 1) {
        console.error('مؤشر الكتلة غير صحيح');
        return false;
      }

      // التحقق من الوقت
      if (previousBlock && this.timestamp <= previousBlock.timestamp) {
        console.error('وقت الكتلة غير صحيح');
        return false;
      }

      // التحقق من Merkle Root
      if (this.merkleRoot !== this.calculateMerkleRoot()) {
        console.error('Merkle Root غير صحيح');
        return false;
      }

      // التحقق من صحة جميع المعاملات
      for (const tx of this.transactions) {
        const transaction = Transaction.fromJSON(tx);
        if (!transaction.isValid() || !transaction.isBusinessValid()) {
          console.error(`المعاملة ${tx.id} غير صحيحة`);
          return false;
        }
      }

      // التحقق من حجم الكتلة
      const blockSize = JSON.stringify(this.transactions).length;
      if (blockSize > CONSTANTS.MAX_BLOCK_SIZE) {
        console.error('حجم الكتلة كبير جداً');
        return false;
      }

      // التحقق من عدم تكرار المعاملات
      const txIds = new Set();
      for (const tx of this.transactions) {
        if (txIds.has(tx.id)) {
          console.error(`المعاملة ${tx.id} مكررة`);
          return false;
        }
        txIds.add(tx.id);
      }

      return true;
    } catch (error) {
      console.error('خطأ في التحقق من صحة الكتلة:', error);
      return false;
    }
  }

  /**
   * التحقق من proof of work
   */
  hasValidProofOfWork(): boolean {
    const target = Array(this.difficulty + 1).join('0');
    return this.hash.substring(0, this.difficulty) === target;
  }

  /**
   * حساب إجمالي الرسوم في الكتلة
   */
  getTotalFees(): number {
    return this.transactions.reduce((total, tx) => total + tx.fee, 0);
  }

  /**
   * حساب إجمالي المبالغ المحولة
   */
  getTotalAmount(): number {
    return this.transactions.reduce((total, tx) => total + tx.amount, 0);
  }

  /**
   * الحصول على معاملات نوع معين
   */
  getTransactionsByType(type: string): ITransaction[] {
    return this.transactions.filter(tx => tx.type === type);
  }

  /**
   * البحث عن معاملة بالمعرف
   */
  findTransaction(txId: string): ITransaction | undefined {
    return this.transactions.find(tx => tx.id === txId);
  }

  /**
   * إضافة توقيع المُصدّق (للPoS)
   */
  signByValidator(privateKey: string): void {
    if (!this.validator) {
      throw new Error('لا يوجد مُصدّق محدد');
    }

    const blockHash = this.calculateHash();
    const signature = crypto
      .createSign('SHA256')
      .update(blockHash)
      .sign(privateKey, 'hex');
    
    this.signature = signature;
  }

  /**
   * التحقق من توقيع المُصدّق
   */
  verifyValidatorSignature(publicKey: string): boolean {
    if (!this.signature || !this.validator) {
      return false;
    }

    try {
      const blockHash = this.calculateHash();
      return crypto
        .createVerify('SHA256')
        .update(blockHash)
        .verify(publicKey, this.signature, 'hex');
    } catch (error) {
      console.error('خطأ في التحقق من توقيع المُصدّق:', error);
      return false;
    }
  }

  /**
   * تحويل الكتلة إلى JSON
   */
  toJSON(): IBlock {
    return {
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      previousHash: this.previousHash,
      hash: this.hash,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot,
      difficulty: this.difficulty,
      validator: this.validator,
      signature: this.signature
    };
  }

  /**
   * إنشاء كتلة من JSON
   */
  static fromJSON(data: IBlock): Block {
    const block = new Block(
      data.index,
      data.transactions,
      data.previousHash,
      data.difficulty,
      data.validator
    );

    block.timestamp = data.timestamp;
    block.hash = data.hash;
    block.nonce = data.nonce;
    block.merkleRoot = data.merkleRoot;
    block.signature = data.signature;

    return block;
  }

  /**
   * إنشاء كتلة الجينيسيس
   */
  static createGenesisBlock(genesisTransactions: ITransaction[]): Block {
    const block = new Block(0, genesisTransactions, '0', 1);
    block.timestamp = 1704067200000; // 1 يناير 2024
    block.hash = block.calculateHash();
    return block;
  }

  /**
   * الحصول على ملخص الكتلة
   */
  getSummary(): object {
    return {
      index: this.index,
      hash: this.hash,
      previousHash: this.previousHash,
      timestamp: new Date(this.timestamp).toISOString(),
      transactionCount: this.transactions.length,
      totalAmount: this.getTotalAmount(),
      totalFees: this.getTotalFees(),
      validator: this.validator,
      difficulty: this.difficulty,
      size: JSON.stringify(this.transactions).length
    };
  }
}
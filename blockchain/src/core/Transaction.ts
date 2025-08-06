/**
 * MADU Transaction Class
 * فئة المعاملات للدينار المغاربي الرقمي
 */

import * as crypto from 'crypto';
import { ec as EC } from 'elliptic';
import { ITransaction, TransactionType } from '../types';
import { CONSTANTS } from '../config';

const ec = new EC('secp256k1');

export class Transaction implements ITransaction {
  public id: string;
  public fromAddress: string | null;
  public toAddress: string;
  public amount: number;
  public fee: number;
  public timestamp: number;
  public signature?: string;
  public data?: any;
  public type: TransactionType;

  constructor(
    fromAddress: string | null,
    toAddress: string,
    amount: number,
    type: TransactionType = TransactionType.TRANSFER,
    data?: any
  ) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type;
    this.data = data;
    this.timestamp = Date.now();
    this.fee = this.calculateFee();
    this.id = this.calculateHash();
  }

  /**
   * حساب hash المعاملة
   */
  calculateHash(): string {
    const dataString = JSON.stringify({
      from: this.fromAddress,
      to: this.toAddress,
      amount: this.amount,
      fee: this.fee,
      timestamp: this.timestamp,
      type: this.type,
      data: this.data
    });

    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex');
  }

  /**
   * حساب رسوم المعاملة
   */
  calculateFee(): number {
    let baseFee = CONSTANTS.MIN_TRANSACTION_FEE;

    // رسوم إضافية حسب نوع المعاملة
    switch (this.type) {
      case TransactionType.SMART_CONTRACT:
        baseFee *= 10; // رسوم أعلى للعقود الذكية
        break;
      case TransactionType.STAKE:
      case TransactionType.UNSTAKE:
        baseFee *= 2; // رسوم أعلى لعمليات الرهان
        break;
      default:
        break;
    }

    // رسوم إضافية للبيانات الإضافية
    if (this.data) {
      const dataSize = JSON.stringify(this.data).length;
      baseFee += (dataSize / 1024) * CONSTANTS.MIN_TRANSACTION_FEE;
    }

    // رسوم نسبية حسب المبلغ (0.01%)
    if (this.amount > 0) {
      baseFee += this.amount * 0.0001;
    }

    return Math.max(baseFee, CONSTANTS.MIN_TRANSACTION_FEE);
  }

  /**
   * توقيع المعاملة بالمفتاح الخاص
   */
  signTransaction(signingKey: string): void {
    if (this.fromAddress === null) {
      throw new Error('لا يمكن توقيع معاملات الجينيسيس');
    }

    if (signingKey.length !== 64) {
      throw new Error('مفتاح التوقيع غير صحيح');
    }

    const keyPair = ec.keyFromPrivate(signingKey, 'hex');
    const publicKey = keyPair.getPublic('hex');
    const expectedAddress = this.getAddressFromPublicKey(publicKey);

    if (expectedAddress !== this.fromAddress) {
      throw new Error('لا يمكنك توقيع معاملات من عناوين أخرى');
    }

    const hashTx = this.calculateHash();
    const sig = keyPair.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  /**
   * التحقق من صحة توقيع المعاملة
   */
  isValid(): boolean {
    // معاملات الجينيسيس صحيحة دائماً
    if (this.fromAddress === null) {
      return true;
    }

    if (!this.signature || this.signature.length === 0) {
      return false;
    }

    try {
      const publicKey = this.getPublicKeyFromSignature();
      const keyPair = ec.keyFromPublic(publicKey, 'hex');
      const hashTx = this.calculateHash();
      
      return keyPair.verify(hashTx, this.signature);
    } catch (error) {
      console.error('خطأ في التحقق من التوقيع:', error);
      return false;
    }
  }

  /**
   * استخراج المفتاح العام من التوقيع
   */
  private getPublicKeyFromSignature(): string {
    if (!this.signature) {
      throw new Error('لا يوجد توقيع');
    }

    const hashTx = this.calculateHash();
    const signature = ec.signature.importDER(this.signature, 'hex');
    
    // محاولة استرداد المفتاح العام من التوقيع
    for (let recovery = 0; recovery < 4; recovery++) {
      try {
        const keyPair = ec.recoverPubKey(hashTx, signature, recovery);
        const publicKey = keyPair.encode('hex');
        const address = this.getAddressFromPublicKey(publicKey);
        
        if (address === this.fromAddress) {
          return publicKey;
        }
      } catch (error) {
        continue;
      }
    }

    throw new Error('فشل في استرداد المفتاح العام');
  }

  /**
   * استخراج العنوان من المفتاح العام
   */
  private getAddressFromPublicKey(publicKey: string): string {
    const hash = crypto
      .createHash('sha256')
      .update(publicKey, 'hex')
      .digest();

    const ripemd = crypto
      .createHash('ripemd160')
      .update(hash)
      .digest('hex');

    return '0x' + ripemd;
  }

  /**
   * التحقق من صحة المعاملة (القواعد التجارية)
   */
  isBusinessValid(): boolean {
    // التحقق من الحقول الأساسية
    if (!this.toAddress || this.toAddress.length !== 42) {
      return false;
    }

    if (this.amount < 0) {
      return false;
    }

    if (this.fee < CONSTANTS.MIN_TRANSACTION_FEE) {
      return false;
    }

    // التحقق من حجم البيانات
    if (this.data) {
      const dataSize = JSON.stringify(this.data).length;
      if (dataSize > CONSTANTS.MAX_TRANSACTION_SIZE) {
        return false;
      }
    }

    // التحقق من الوقت (لا يمكن أن تكون في المستقبل البعيد)
    const now = Date.now();
    if (this.timestamp > now + 300000) { // 5 دقائق في المستقبل
      return false;
    }

    return true;
  }

  /**
   * تحويل المعاملة إلى JSON
   */
  toJSON(): ITransaction {
    return {
      id: this.id,
      fromAddress: this.fromAddress,
      toAddress: this.toAddress,
      amount: this.amount,
      fee: this.fee,
      timestamp: this.timestamp,
      signature: this.signature,
      data: this.data,
      type: this.type
    };
  }

  /**
   * إنشاء معاملة من JSON
   */
  static fromJSON(data: ITransaction): Transaction {
    const tx = new Transaction(
      data.fromAddress,
      data.toAddress,
      data.amount,
      data.type,
      data.data
    );

    tx.id = data.id;
    tx.timestamp = data.timestamp;
    tx.fee = data.fee;
    tx.signature = data.signature;

    return tx;
  }

  /**
   * إنشاء معاملة جينيسيس
   */
  static createGenesisTransaction(toAddress: string, amount: number): Transaction {
    return new Transaction(
      null,
      toAddress,
      amount,
      TransactionType.GENESIS
    );
  }

  /**
   * إنشاء معاملة مكافأة
   */
  static createRewardTransaction(toAddress: string, amount: number): Transaction {
    return new Transaction(
      null,
      toAddress,
      amount,
      TransactionType.REWARD
    );
  }
}
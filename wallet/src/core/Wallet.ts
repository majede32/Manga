/**
 * MADU Digital Wallet
 * المحفظة الرقمية للدينار المغاربي
 */

import * as crypto from 'crypto';
import { ec as EC } from 'elliptic';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import * as CryptoJS from 'crypto-js';
import * as QRCode from 'qrcode';
import { IWallet, ITransaction, TransactionType, CountryCode, KYCLevel } from '../types';

const ec = new EC('secp256k1');

export class Wallet implements IWallet {
  public address: string;
  public publicKey: string;
  public privateKey: string;
  public balance: number;
  private mnemonic?: string;
  private encrypted: boolean;
  private country: CountryCode;
  private kycLevel: KYCLevel;

  constructor(
    privateKey?: string,
    country: CountryCode = CountryCode.TUNISIA,
    kycLevel: KYCLevel = KYCLevel.BASIC
  ) {
    this.encrypted = false;
    this.balance = 0;
    this.country = country;
    this.kycLevel = kycLevel;

    if (privateKey) {
      this.privateKey = privateKey;
      this.generateFromPrivateKey();
    } else {
      this.generateNewWallet();
    }
  }

  /**
   * إنشاء محفظة جديدة
   */
  private generateNewWallet(): void {
    // إنشاء مفتاح خاص عشوائي
    const keyPair = ec.genKeyPair();
    this.privateKey = keyPair.getPrivate('hex');
    this.publicKey = keyPair.getPublic('hex');
    this.address = this.generateAddress();

    // إنشاء عبارة استرداد
    this.mnemonic = bip39.generateMnemonic(256); // 24 كلمة
  }

  /**
   * إنشاء محفظة من مفتاح خاص
   */
  private generateFromPrivateKey(): void {
    if (this.privateKey.length !== 64) {
      throw new Error('المفتاح الخاص غير صحيح');
    }

    const keyPair = ec.keyFromPrivate(this.privateKey, 'hex');
    this.publicKey = keyPair.getPublic('hex');
    this.address = this.generateAddress();
  }

  /**
   * إنشاء العنوان من المفتاح العام
   */
  private generateAddress(): string {
    const hash = crypto
      .createHash('sha256')
      .update(this.publicKey, 'hex')
      .digest();

    const ripemd = crypto
      .createHash('ripemd160')
      .update(hash)
      .digest('hex');

    // إضافة بادئة للبلد
    const countryPrefix = this.getCountryPrefix();
    return '0x' + countryPrefix + ripemd.substring(2);
  }

  /**
   * الحصول على بادئة البلد
   */
  private getCountryPrefix(): string {
    switch (this.country) {
      case CountryCode.TUNISIA:
        return 'TN';
      case CountryCode.LIBYA:
        return 'LY';
      case CountryCode.ALGERIA:
        return 'DZ';
      default:
        return '00';
    }
  }

  /**
   * توقيع معاملة
   */
  signTransaction(transaction: ITransaction): string {
    if (this.encrypted) {
      throw new Error('المحفظة مشفرة. قم بفك التشفير أولاً');
    }

    const txHash = this.calculateTransactionHash(transaction);
    const keyPair = ec.keyFromPrivate(this.privateKey, 'hex');
    const signature = keyPair.sign(txHash, 'base64');
    
    return signature.toDER('hex');
  }

  /**
   * حساب hash المعاملة
   */
  private calculateTransactionHash(transaction: ITransaction): string {
    const txData = JSON.stringify({
      from: transaction.fromAddress,
      to: transaction.toAddress,
      amount: transaction.amount,
      fee: transaction.fee,
      timestamp: transaction.timestamp,
      type: transaction.type,
      data: transaction.data
    });

    return crypto
      .createHash('sha256')
      .update(txData)
      .digest('hex');
  }

  /**
   * إنشاء معاملة جديدة
   */
  createTransaction(
    toAddress: string,
    amount: number,
    type: TransactionType = TransactionType.TRANSFER,
    data?: any
  ): ITransaction {
    if (amount <= 0) {
      throw new Error('المبلغ يجب أن يكون أكبر من صفر');
    }

    if (this.balance < amount) {
      throw new Error('الرصيد غير كافي');
    }

    // حساب الرسوم
    const fee = this.calculateTransactionFee(amount, type, data);

    if (this.balance < amount + fee) {
      throw new Error('الرصيد غير كافي لتغطية الرسوم');
    }

    const transaction: ITransaction = {
      id: crypto.randomUUID(),
      fromAddress: this.address,
      toAddress,
      amount,
      fee,
      timestamp: Date.now(),
      type,
      data
    };

    // توقيع المعاملة
    transaction.signature = this.signTransaction(transaction);

    return transaction;
  }

  /**
   * حساب رسوم المعاملة
   */
  private calculateTransactionFee(
    amount: number,
    type: TransactionType,
    data?: any
  ): number {
    let baseFee = 0.00001; // 0.00001 MADU

    // رسوم إضافية حسب نوع المعاملة
    switch (type) {
      case TransactionType.SMART_CONTRACT:
        baseFee *= 10;
        break;
      case TransactionType.STAKE:
      case TransactionType.UNSTAKE:
        baseFee *= 2;
        break;
    }

    // رسوم البيانات الإضافية
    if (data) {
      const dataSize = JSON.stringify(data).length;
      baseFee += (dataSize / 1024) * 0.00001;
    }

    // رسوم نسبية (0.01%)
    baseFee += amount * 0.0001;

    return Math.max(baseFee, 0.00001);
  }

  /**
   * تشفير المحفظة بكلمة مرور
   */
  encrypt(password: string): void {
    if (this.encrypted) {
      throw new Error('المحفظة مشفرة بالفعل');
    }

    const walletData = {
      privateKey: this.privateKey,
      mnemonic: this.mnemonic
    };

    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(walletData),
      password
    ).toString();

    // مسح البيانات الحساسة من الذاكرة
    this.privateKey = encrypted;
    this.mnemonic = undefined;
    this.encrypted = true;
  }

  /**
   * فك تشفير المحفظة
   */
  decrypt(password: string): boolean {
    if (!this.encrypted) {
      throw new Error('المحفظة غير مشفرة');
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(this.privateKey, password);
      const walletData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

      this.privateKey = walletData.privateKey;
      this.mnemonic = walletData.mnemonic;
      this.encrypted = false;

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * تصدير المحفظة
   */
  export(format: 'json' | 'keystore' = 'json'): string {
    if (this.encrypted) {
      throw new Error('المحفظة مشفرة. قم بفك التشفير أولاً');
    }

    const walletData = {
      address: this.address,
      publicKey: this.publicKey,
      privateKey: this.privateKey,
      mnemonic: this.mnemonic,
      country: this.country,
      kycLevel: this.kycLevel,
      createdAt: Date.now(),
      version: '1.0.0'
    };

    switch (format) {
      case 'json':
        return JSON.stringify(walletData, null, 2);
      case 'keystore':
        // تنسيق keystore متوافق مع Ethereum
        return JSON.stringify({
          version: 3,
          id: crypto.randomUUID(),
          address: this.address.substring(2),
          crypto: {
            cipher: 'aes-128-ctr',
            ciphertext: this.privateKey,
            kdf: 'scrypt',
            mac: crypto.createHash('sha256').update(this.privateKey).digest('hex')
          }
        });
      default:
        return JSON.stringify(walletData);
    }
  }

  /**
   * استيراد محفظة
   */
  static import(walletData: string, format: 'json' | 'keystore' | 'mnemonic' = 'json'): Wallet {
    switch (format) {
      case 'json':
        const data = JSON.parse(walletData);
        const wallet = new Wallet(data.privateKey, data.country, data.kycLevel);
        wallet.mnemonic = data.mnemonic;
        return wallet;

      case 'mnemonic':
        return Wallet.fromMnemonic(walletData);

      case 'keystore':
        const keystoreData = JSON.parse(walletData);
        return new Wallet(keystoreData.crypto.ciphertext);

      default:
        throw new Error('تنسيق غير مدعوم');
    }
  }

  /**
   * إنشاء محفظة من عبارة الاسترداد
   */
  static fromMnemonic(mnemonic: string, index: number = 0): Wallet {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('عبارة الاسترداد غير صحيحة');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    
    // استخدام مسار BIP44 للمحافظ
    const derivationPath = `m/44'/2024'/${index}'/0/0`;
    const child = hdkey.derive(derivationPath);
    
    const wallet = new Wallet(child.privateKey.toString('hex'));
    wallet.mnemonic = mnemonic;
    
    return wallet;
  }

  /**
   * إنشاء رمز QR للعنوان
   */
  async generateQRCode(amount?: number): Promise<string> {
    let qrData = this.address;
    
    if (amount) {
      qrData += `?amount=${amount}`;
    }

    return await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }

  /**
   * التحقق من صحة العنوان
   */
  static isValidAddress(address: string): boolean {
    if (!address.startsWith('0x') || address.length !== 42) {
      return false;
    }

    // التحقق من hexadecimal
    const hex = address.substring(2);
    return /^[0-9a-fA-F]+$/.test(hex);
  }

  /**
   * الحصول على معلومات المحفظة
   */
  getInfo(): object {
    return {
      address: this.address,
      publicKey: this.publicKey,
      balance: this.balance,
      country: this.country,
      kycLevel: this.kycLevel,
      encrypted: this.encrypted,
      hasBackup: !!this.mnemonic
    };
  }

  /**
   * تحديث الرصيد
   */
  updateBalance(newBalance: number): void {
    this.balance = Math.max(0, newBalance);
  }

  /**
   * إنشاء نسخة احتياطية
   */
  createBackup(): object {
    if (this.encrypted) {
      throw new Error('المحفظة مشفرة. قم بفك التشفير أولاً');
    }

    return {
      mnemonic: this.mnemonic,
      privateKey: this.privateKey,
      address: this.address,
      timestamp: Date.now(),
      instructions: [
        'احتفظ بهذه المعلومات في مكان آمن',
        'لا تشاركها مع أي شخص',
        'استخدم عبارة الاسترداد لاستعادة محفظتك'
      ]
    };
  }

  /**
   * التحقق من إمكانية إجراء المعاملة
   */
  canTransact(amount: number): boolean {
    const fee = this.calculateTransactionFee(amount, TransactionType.TRANSFER);
    return this.balance >= amount + fee;
  }

  /**
   * الحصول على الحد الأقصى للتحويل
   */
  getMaxTransferAmount(): number {
    const baseFee = 0.00001;
    if (this.balance <= baseFee) {
      return 0;
    }

    // حساب تقريبي للحد الأقصى
    const maxAmount = this.balance * 0.999; // ترك هامش للرسوم
    return Math.max(0, maxAmount);
  }
}
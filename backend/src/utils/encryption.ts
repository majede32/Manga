import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@/config/database';

// تكوين التشفير
const SALT_ROUNDS = 12;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

// تشفير كلمة المرور
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error('فشل في تشفير كلمة المرور');
  }
};

// التحقق من كلمة المرور
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('فشل في التحقق من كلمة المرور');
  }
};

// إنشاء JWT token
export const generateToken = (payload: any, expiresIn: string = '24h'): string => {
  try {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn,
      issuer: 'tunisian-postal-bank',
      audience: 'tpb-users'
    });
  } catch (error) {
    throw new Error('فشل في إنشاء التوكن');
  }
};

// التحقق من JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      issuer: 'tunisian-postal-bank',
      audience: 'tpb-users'
    });
  } catch (error) {
    throw new Error('توكن غير صالح');
  }
};

// إنشاء refresh token
export const generateRefreshToken = (userId: number): string => {
  try {
    return jwt.sign(
      { userId, type: 'refresh' },
      config.jwt.secret,
      {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'tunisian-postal-bank',
        audience: 'tpb-users'
      }
    );
  } catch (error) {
    throw new Error('فشل في إنشاء refresh token');
  }
};

// تشفير البيانات الحساسة
export const encryptData = (data: string, key: string): string => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipher(ALGORITHM, key);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  } catch (error) {
    throw new Error('فشل في تشفير البيانات');
  }
};

// فك تشفير البيانات الحساسة
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('فشل في فك تشفير البيانات');
  }
};

// إنشاء رمز عشوائي
export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// إنشاء رمز OTP
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// إنشاء رمز QR
export const generateQRSecret = (): string => {
  return crypto.randomBytes(20).toString('base32');
};

// تشفير رقم الحساب
export const encryptAccountNumber = (accountNumber: string): string => {
  const key = process.env.ACCOUNT_ENCRYPTION_KEY || 'default_key_2024';
  return encryptData(accountNumber, key);
};

// فك تشفير رقم الحساب
export const decryptAccountNumber = (encryptedAccountNumber: string): string => {
  const key = process.env.ACCOUNT_ENCRYPTION_KEY || 'default_key_2024';
  return decryptData(encryptedAccountNumber, key);
};

// إنشاء hash للبيانات
export const createHash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// التحقق من صحة البيانات
export const validateData = (data: any, schema: any): boolean => {
  try {
    const { error } = schema.validate(data);
    return !error;
  } catch (error) {
    return false;
  }
};

// تنظيف البيانات المدخلة
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

// إنشاء معرف فريد
export const generateUniqueId = (): string => {
  return crypto.randomUUID();
};

// تشفير رقم الهاتف
export const encryptPhoneNumber = (phoneNumber: string): string => {
  const key = process.env.PHONE_ENCRYPTION_KEY || 'phone_key_2024';
  return encryptData(phoneNumber, key);
};

// فك تشفير رقم الهاتف
export const decryptPhoneNumber = (encryptedPhoneNumber: string): string => {
  const key = process.env.PHONE_ENCRYPTION_KEY || 'phone_key_2024';
  return decryptData(encryptedPhoneNumber, key);
};